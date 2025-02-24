import { db, collection, getDocs, doc, updateDoc } from './firebaseConfig.js';
import { logAction } from './logs.js';


export async function loadTableData() {
    const tbody = document.getElementById('dataTable');
    tbody.innerHTML = ''; // Clear table content

    let stdNo = 0;
    try {
        // Fetch all users from Firestore
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            AddItemToTable(data.fullName, data.pensionerStatus, data.serialNumber, doc.id, ++stdNo, tbody);
        });

        // Update pagination or any display rules
        showRows();
    } catch (error) {
        console.error("Error loading table data: ", error);
    }
}

function AddItemToTable(name, ps, sn, docId, stdNo, tbody) {
    let trow = document.createElement("tr");
    trow.innerHTML = `
        <td>${stdNo}</td>
        <td>${name}</td>
        <td>${ps}</td>
        <td>${sn}</td>
        <td>
            <div class="action-buttons">
            <button class="action-buttonV" data-docid="${docId}">
                <span class="eye-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C3.5 7 7.5 4 12 4C16.5 4 20.5 7 23 12C20.5 17 16.5 20 12 20C7.5 20 3.5 17 1 12Z" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/>
                    </svg>
                </span>
            </button>
            <button class="action-buttonU" data-docid="${docId}">
                <span class="edit-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 20H21" stroke="white" stroke-width="2" stroke-linecap="round"/>
                        <path d="M16.5 3.5L20.5 7.5L7 21H3V17L16.5 3.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
            </button>
            <button class="action-buttonD" data-docid="${docId}">
                <span class="delete-icon">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <path d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="10" y1="11" x2="10" y2="17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <line x1="14" y1="11" x2="14" y2="17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
                </span>
            </button>
            <div>
        </td>
    `;
    tbody.appendChild(trow);

    // Add event listeners for the action buttons
    trow.querySelector('.action-buttonV').addEventListener('click', () => {
        logAction('Viewed user', name); // Log the view action
    });

    trow.querySelector('.action-buttonU').addEventListener('click', () => {
        logAction('Updated user', name); // Log the update action
    });

    trow.querySelector('.action-buttonD').addEventListener('click', () => {
        logAction('Deleted user', name); // Log the delete action
    });
}

export function updateFileAvailability(modal, data, buttonSelector, fileField) {
    const button = modal.querySelector(buttonSelector);
    if (!button) {
        console.error(`${buttonSelector} not found in the modal.`);
        return;
    }

    let latestFileUrl = '';
    if (data[fileField] && Array.isArray(data[fileField])) {
        const latestFile = data[fileField].sort((a, b) => b.timestamp - a.timestamp)[0];
        latestFileUrl = latestFile ? latestFile.url : '';
    }

    if (latestFileUrl) {
        button.setAttribute('onclick', `window.open('${latestFileUrl}', '_blank')`);
        button.removeAttribute('disabled');
        button.textContent = 'View';
    } else {
        button.setAttribute('disabled', true);
        button.textContent = 'Unavailable';
    }
}