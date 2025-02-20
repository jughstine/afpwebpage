import { app, db, auth, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp, writeBatch, deleteUser , getFirestore } from './firebaseConfig.js';import { loadTableData } from './table.js';
import { openModal, openModalForUpdate, closeModal } from './modal.js';
import { createAccount, updateAccount } from './account.js';
import { displayLogs, clearModalLogs, logAction } from './logs.js';


async function deleteDocumentAndAuth(docId) {
    // Confirm deletion action
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        const db = getFirestore();

        // Step 1: Delete the Firestore document
        await deleteDoc(doc(db, "users", docId));
        console.log(`Firestore document with UID ${docId} deleted successfully.`);

        // Step 2: Delete the authentication user via server-side API
        const apiUrl = process.env.API_BASE_URL || "http://localhost:3000"; // Use environment variable
        const response = await fetch(`${apiUrl}/deleteUser/${docId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to delete authentication user: ${errorText}`);
            alert(`Failed to delete authentication user. Error: ${errorText}`);
            return;
        }

        console.log(`Authentication user with UID ${docId} deleted successfully.`);
        alert("User and associated data successfully deleted!");

        // Step 3: Reload table data after successful deletion
        loadTableData();
    } catch (error) {
        console.error("An error occurred while deleting the user or data:", error);
        alert("An error occurred while deleting the user or document. Please try again.");
    }
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    loadTableData();

    const tableBody = document.getElementById('dataTable');
    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const docId = target.getAttribute('data-docid'); // Get docId (which is the uid)

        if (target.matches('.action-buttonV')) {
            openModal(docId);
        } else if (target.matches('.action-buttonU')) {
            openModalForUpdate(docId);
        } else if (target.matches('.action-buttonD')) {
            deleteDocumentAndAuth(docId); // Pass docId (which is the uid) to delete function
        }
        showRows(); // Optional, for pagination or additional UI changes
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toUpperCase();
        const tbody = document.getElementById('dataTable');
        const tr = tbody.getElementsByTagName('tr');
        let displayCount = 0;

        // Loop through all table rows, and hide those that don't match the search query
        for (let i = 0; i < tr.length; i++) {
            tr[i].style.display = 'none'; // Initially hide all rows
            let td = tr[i].getElementsByTagName('td');
            for (let j = 0; j < td.length; j++) {
                if (td[j]) {
                    let txtValue = td[j].textContent || td[j].innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        if (displayCount < 10) { // Only display up to 10 rows
                            tr[i].style.display = '';
                            displayCount++;
                            break; // Stop checking other cells in the same row once a match is found
                        }
                    }
                }
            }
        }
    });
});


 // Modal functionality
 var modalAdd = document.getElementById("addAccountModal");
    var closeBtn = document.getElementsByClassName("close-buttonAdd")[0];

    // Event listener for Add Account button
    document.getElementById("addAccountBtn").addEventListener("click", function() {
        modalAdd.style.display = "block";
    });

    closeBtn.onclick = function() {
    modalAdd.style.display = "none"; // Close the modal

    // Select all input elements within the modal and clear their values
    const inputs = modalAdd.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = ''; // Reset input fields to empty
    });
}

    window.onclick = function(event) {
        if (event.target == modalAdd) {
            modalAdd.style.display = "none";
            document.getElementById('addAccountForm').reset(); // Reset form fields
        }
    }

    document.getElementById('addAccountForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Prevent default form submission

  const fullName = document.getElementById('fullName').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Simple password match check (Consider using more secure practices for production)
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return; // Stop execution if passwords don't match
  }

  // Check for existing entries
  const exists = await checkForExistingEntries(phoneNumber, email);
  if (exists) {
    // Do not proceed with submission if there are existing entries
    return;
  }

  // If no existing entries, proceed with adding the new account
  try {
    const docRef = await addDoc(collection(db, "accounts"), {
      fullName: fullName,
      phoneNumber: phoneNumber,
      email: email,
      password: password // Note: Consider security implications of storing passwords
    });
    alert("Account Created Succesfully");

    console.log("Document written with ID: ", docRef.id);
    modalAdd.style.display = "none"; // Close the modal on successful submission
    document.getElementById('addAccountForm').reset(); // Reset form fields
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});

// Function to check for existing entries
async function checkForExistingEntries(phoneNumber, email) {
  const accountsRef = collection(db, 'accounts');
  
  // Query for phone number
  const phoneQuery = query(accountsRef, where('phoneNumber', '==', phoneNumber));
  const phoneQuerySnapshot = await getDocs(phoneQuery);

  // Query for email
  const emailQuery = query(accountsRef, where('email', '==', email));
  const emailQuerySnapshot = await getDocs(emailQuery);

  if (!phoneQuerySnapshot.empty) {
    alert('A user with this phone number already exists.');
    return true; // Existing phone number found
  }

  if (!emailQuerySnapshot.empty) {
    alert('A user with this email already exists.');
    return true; // Existing email found
  }

  return false; // No existing entries found
}




document.addEventListener('DOMContentLoaded', function() {
    var updateModal = document.getElementById('updateAccountModal');
    var updateCloseBtn = updateModal.querySelector('.close-buttonUpdate');

    // Function to populate the dropdown with full names from Firestore
    async function populateDropdown() {
        const updateRoleSelect = document.getElementById('updateRole');
        updateRoleSelect.innerHTML = '<option value="">Select Account</option>'; // Clear current options
        
        const querySnapshot = await getDocs(collection(db, "accounts"));
        querySnapshot.forEach(doc => {
            const account = doc.data();
            const option = document.createElement('option');
            option.value = doc.id; // Use document ID as the value
            option.textContent = account.fullName; // Use fullName as the text content
            updateRoleSelect.appendChild(option);
        });
    }

    // Function to clear the Update Account form fields
    function clearUpdateAccountForm() {
        document.getElementById('updateFullName').value = '';
        document.getElementById('updatePhoneNumber').value = '';
        document.getElementById('updateEmail').value = '';
        document.getElementById('updatePassword').value = '';
        // Optionally clear other fields if needed
    }

    // Event listener for Update Account button
    document.getElementById('updateAccountBtn').addEventListener('click', function() {
        populateDropdown(); // Populate the dropdown when the Update modal is opened
        updateModal.style.display = 'block';
    });

    // Close button for Update Modal
    updateCloseBtn.addEventListener('click', function() {
        updateModal.style.display = 'none';
        clearUpdateAccountForm();
        document.getElementById('updateRole').selectedIndex = 0;
    });

    // Clicking outside the modal content but within the modal area will close the modal
    window.addEventListener('click', function(event) {
        if (event.target == updateModal) {
            updateModal.style.display = 'none';
            clearUpdateAccountForm();
            document.getElementById('updateRole').selectedIndex = 0;
        }
    });

    // Fetch and populate form when a name is selected from the dropdown
    document.getElementById('updateRole').addEventListener('change', async function() {
        const selectedAccountId = this.value;

        if (selectedAccountId) {
            const docRef = doc(db, "accounts", selectedAccountId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const accountData = docSnap.data();
                document.getElementById('updateFullName').value = accountData.fullName || '';
                document.getElementById('updatePhoneNumber').value = accountData.phoneNumber || '';
                document.getElementById('updateEmail').value = accountData.email || '';
                document.getElementById('updatePassword').value = accountData.password || '';
            } else {
                console.log("No such document!");
                clearUpdateAccountForm();
            }
        } else {
            clearUpdateAccountForm();
        }
    });

    // Event listener for the Update Account form submission
    document.getElementById('updateAccountForm').addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent the default form submission

        const selectedAccountId = document.getElementById('updateRole').value;
        if (!selectedAccountId) {
            alert('Please select an account to update.');
            return;
        }
        
        const fullName = document.getElementById('updateFullName').value;
        const phoneNumber = document.getElementById('updatePhoneNumber').value;
        const email = document.getElementById('updateEmail').value;
        const password = document.getElementById('updatePassword').value;
        

        const emailExists = await checkForExistingField(selectedAccountId, 'email', email);
        if (emailExists) {
            alert('This email is already used by another account.');
            return; // Stop execution if email already exists
        }

        // Check for existing phone number in any other account
        const phoneExists = await checkForExistingField(selectedAccountId, 'phoneNumber', phoneNumber);
        if (phoneExists) {
            alert('This phone number is already used by another account.');
            return; // Stop execution if phone number already exists
        }

        // Reference to the Firestore document
        const accountRef = doc(db, 'accounts', selectedAccountId);

        // Update the document in Firestore
        try {
            await updateDoc(accountRef, {
                fullName: fullName,
                phoneNumber: phoneNumber,
                email: email,
                password: password
            });
            alert('Account updated successfully.');
            updateModal.style.display = 'none'; // Optionally close the modal after update
            clearUpdateAccountForm(); // Clear the form fields
            document.getElementById('updateRole').selectedIndex = 0; // Reset the dropdown
        } catch (error) {
            console.error('Error updating document: ', error);
            alert('Failed to update the account.');
        }
    });

    async function checkForExistingField(accountId, fieldName, fieldValue) {
        const accountsRef = collection(db, 'accounts');
        const q = query(accountsRef, where(fieldName, '==', fieldValue));
        const querySnapshot = await getDocs(q);

        // Check if any document with the same field value exists and is not the current account
        return querySnapshot.docs.some(doc => doc.id !== accountId);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const signOutBtn = document.getElementById('signOutBtn');

    // Check if the sign out button exists to avoid errors in pages without it
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            const confirmation = confirm("Are you sure you want to sign out?");
            if (confirmation) {
                // User clicked 'OK'
                window.location.href = '../landing/landingpage.html';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
            const fullName = sessionStorage.getItem("fullName"); // Retrieve the full name from session storage
            if (fullName) {
                document.getElementById('username').textContent = fullName; // Set the full name in the dashboard
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            const fullName = sessionStorage.getItem("fullName"); // Retrieve the full name from session storage
            document.getElementById('username').textContent = fullName; // Update greeting

            // Get buttons
            const addAccountBtn = document.getElementById('addAccountBtn');
            const updateAccountBtn = document.getElementById('updateAccountBtn');
            const viewLogsBtn = document.getElementById('viewLogsBtn');

            // Disable buttons if not Super Admin
            if (fullName !== "Super Admin") {
                addAccountBtn.disabled = true;
                updateAccountBtn.disabled = true;
                viewLogsBtn.disabled = true;
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
    const viewLogsBtn = document.getElementById('viewLogsBtn');
    const modalBackground = document.querySelector('.modalLogs-background');
    const closeLogsButton = document.querySelector('.closeLogs-button');

    // Function to show the modal
    const showModalLogs = () => {
        modalBackground.style.display = 'flex'; // Change to 'flex' to display the modal
    };

    // Function to close the modal
    const closeModalLogs = () => {
        modalBackground.style.display = 'none';
    };

    // Attach event listeners
    viewLogsBtn.addEventListener('click', showModalLogs);
    closeLogsButton.addEventListener('click', closeModalLogs);
});

export async function getFullNameFromFirestore(docId) {
    const docRef = doc(db, "users", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        // Retrieve fullName directly from the data object.
        const fullName = data.fullName || 'No fullName provided';
        return fullName;
    } else {
        console.log("No such document!");
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    displayLogs(); // Call the function to display logs on page load

    // Bind the search functionality after the DOM content is loaded to ensure the element is available
    document.getElementById('searchLogs').addEventListener('input', function(e) {
    const searchValue = e.target.value.toLowerCase();
    const logEntries = document.querySelectorAll('.modalLogs-body .log-entry'); // Use correct selector

    logEntries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        if (text.includes(searchValue)) {
            entry.style.display = '';
        } else {
            entry.style.display = 'none';
        }
    });
});

    const clearButton = document.querySelector('.clearLogs-button');
    if (clearButton) {
        clearButton.onclick = clearModalLogs;
    }
});


export function clearLogsUI() {
    // Simplify the UI clearing function to avoid duplication
    const logContainer = document.querySelector('.modalLogs-body');
    logContainer.innerHTML = '';
}
document.addEventListener('DOMContentLoaded', function() {
    const clearButton = document.querySelector('.clearLogs-button');
    if (clearButton) {
        clearButton.onclick = clearModalLogs;
    }
});

document.addEventListener('DOMContentLoaded', function() {

    // Attach event listeners to the buttons
    document.querySelector('.select-all-logs-button').addEventListener('click', selectAllLogs);
    document.querySelector('.unselect-all-logs-button').addEventListener('click', unselectAllLogs);
    document.querySelector('.delete-selected-logs-button').addEventListener('click', deleteSelectedLogs);

});

function selectAllLogs() {
    const logEntries = document.querySelectorAll('.modalLogs-body .log-entry');
    logEntries.forEach(entry => {
        const checkbox = entry.querySelector('.log-checkbox');
        if (checkbox && entry.style.display !== 'none') {
            checkbox.checked = true;
        }
    });
}

function unselectAllLogs() {
    const logEntries = document.querySelectorAll('.modalLogs-body .log-entry');
    logEntries.forEach(entry => {
        const checkbox = entry.querySelector('.log-checkbox');
        if (checkbox && entry.style.display !== 'none') {
            checkbox.checked = false;
        }
    });
}


async function deleteSelectedLogs() {
    const checkboxes = document.querySelectorAll('.log-checkbox');
    const batch = writeBatch(db);
    let hasDeletions = false;

    // Check if any checkboxes are selected
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            hasDeletions = true;
        }
    });

    // Proceed only if there is something to delete and the user confirms the action
    if (hasDeletions && confirm("Do you want to delete the selected logs?")) {
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                const docId = checkbox.getAttribute('data-doc-id');
                if (docId) {
                    const docRef = doc(db, "hlogs", docId);
                    batch.delete(docRef);
                }
            }
        });

        try {
            await batch.commit();
            console.log("Selected logs have been deleted from Firestore.");
            displayLogs(); // Refresh log display after deletion
            alert("Logs successfully deleted."); // Alert the user that logs were successfully deleted
        } catch (error) {
            console.error("Error deleting selected logs: ", error);
            alert("Failed to delete logs. Please try again."); // Inform the user if deletion fails
        }
    } else if (!hasDeletions) {
        console.log("No logs selected for deletion."); // Inform user if no logs were selected
    }
}