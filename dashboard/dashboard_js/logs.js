import { db, collection, addDoc, getDocs, query, orderBy, writeBatch } from './firebaseConfig.js';

const logs = []; // This array will hold all log entries

export async function logAction(action, user) {
    const timestamp = new Date(); // Get current time
    const logEntry = {
        timestamp: timestamp.toLocaleString(), // Convert to Firestore Timestamp
        user: user,
        action: action
    };

    // Add the log entry to the local logs array
    logs.push(logEntry);
    
    // Display logs on the UI
    displayLogs();

    // Add the log entry to the Firestore database
    try {
        await addDoc(collection(db, "hlogs"), logEntry);
        console.log("Log entry added to Firestore");
    } catch (error) {
        console.error("Error adding log entry to Firestore: ", error);
    }
}


export async function displayLogs() {
    const logContainer = document.querySelector('.modalLogs-body');
    logContainer.innerHTML = ''; // Clear previous logs to avoid duplication

    try {
        const logsQuery = query(collection(db, "hlogs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(logsQuery);
        let logCount = 1; // Initialize log counter
        querySnapshot.forEach((doc) => {
            const log = doc.data();
            const logElement = document.createElement('div');
            logElement.classList.add('log-entry');

            // Create checkbox input for the log entry
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'log' + logCount;
            checkbox.classList.add('log-checkbox');
            checkbox.setAttribute('data-doc-id', doc.id);  // Set Firestore document ID to checkbox

            // Create a label for the checkbox
            const label = document.createElement('label');
            label.htmlFor = 'log' + logCount;
            label.textContent = `No.${logCount++} [${log.timestamp}] ${log.user}: ${log.action}`;

            // Append checkbox and label to logElement
            logElement.appendChild(checkbox);
            logElement.appendChild(label);
            logContainer.appendChild(logElement);
        });
    } catch (error) {
        console.error("Error fetching logs from Firestore: ", error);
    }
}


export async function clearModalLogs() {
    // Ensure that the clear button properly handles clearing operations
    const confirmClear = confirm("Are you sure you want to clear all history logs?");
    if (!confirmClear) {
        return; // Stop the function if the user cancels
    }

    try {
        const querySnapshot = await getDocs(collection(db, "hlogs"));
        const batch = writeBatch(db); // Create a batch write operation

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref); // Add delete operation for each document to the batch
        });

        await batch.commit(); // Commit the batch delete operation
        console.log("All logs have been cleared from Firestore.");
        clearLogsUI(); // Also clear logs from the UI
        alert("All history logs have been cleared.");
        location.reload(); // Optional: Reload the page to refresh the state
    } catch (error) {
        console.error("Error clearing logs from Firestore: ", error);
        alert("Failed to clear history logs.");
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