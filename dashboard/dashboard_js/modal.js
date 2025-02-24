import { db, doc, getDoc } from './firebaseConfig.js';
import { updateFileAvailability } from './table.js';

export async function openModal(docId) {
    const modal = document.querySelector('.pensioner-modal');
    const overlay = document.querySelector('.overlay');
    const docRef = doc(db, "users", docId);
    const docSnap = await getDoc(docRef);

    const submissionDateElement = document.getElementById('submissionDate');
    submissionDateElement.textContent = 'Submission Date: ';

    const submitButton = document.querySelector('.submitUpdateButton');
    if (submitButton) {
        submitButton.style.display = 'none';
    }

    if (docSnap.exists()) {
        const data = docSnap.data();
        const idFileField = data.pensionerStatus === 'Principal' ? 'pensionID_files' : 'normalID_files';

        updateFileAvailability(modal, data, '.idFileViewButton', idFileField);
        updateFileAvailability(modal, data, '.videoClipViewButton', 'videoClip_files');
        updateFileAvailability(modal, data, '.retOrderViewButton', 'retOrder_files');
        updateFileAvailability(modal, data, '.oathofAllegianceViewButton', 'oathofAllegiance_files');
        updateFileAvailability(modal, data, '.certofNaturalizationViewButton', 'certofNaturalization_files');
        updateFileAvailability(modal, data, '.identificationDualCitizenViewButton', 'identificationDualCitizen_files');
        updateFileAvailability(modal, data, '.passportViewButton', 'passport_files');

        let birthday = 'No birthday provided';
        if (data.birthday && typeof data.birthday === 'object') {
            birthday = `${data.birthday.month || 'Unknown'} / ${data.birthday.day || 'Unknown'} / ${data.birthday.year || 'Unknown'}`;
        }

        modal.querySelector('.modal-input.fullName').value = data.fullName || 'No name provided';
        modal.querySelector('.modal-input.pensionerStatus').value = data.pensionerStatus || 'No status provided';
        modal.querySelector('.modal-input.beneficiaryType').value = data.beneficiaryType || 'No status provided';
        modal.querySelector('.modal-input.serialNumber').value = data.serialNumber || 'No serial number provided';
        modal.querySelector('.modal-input.localAddress').value = data.localAddress || 'No address provided';
        modal.querySelector('.modal-input.birthday').value = birthday;
        modal.querySelector('.modal-input.phoneNumber').value = data.phoneNumber || 'No phone number provided';
        modal.querySelector('.modal-input.abroadAddress').value = data.abroadAddress || 'No Abroad Address provided';

        if (data.submitTimestamp && data.submitTimestamp.toDate) {
            const submitDate = data.submitTimestamp.toDate();
            const options = { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: 'numeric', minute: 'numeric', second: 'numeric', 
                timeZoneName: 'short', hour12: true 
            };
            const formattedDate = submitDate.toLocaleString("en-US", options);
            submissionDateElement.textContent += formattedDate;
            submissionDateElement.style.color = 'red';
        } else {
            submissionDateElement.textContent += 'Not available';
            submissionDateElement.style.color = 'red';
        }

        let latestPictureUrl = 'assets/nopp.png';
        if (data['2x2Picture_files'] && Array.isArray(data['2x2Picture_files'])) {
            const latestPicture = data['2x2Picture_files'].sort((a, b) => b.timestamp - a.timestamp)[0];
            latestPictureUrl = latestPicture ? latestPicture.url : latestPictureUrl;
        }

        const imageElement = modal.querySelector('.modal-circle img');
        if (imageElement) {
            imageElement.src = latestPictureUrl;
        } else {
            console.error('Image element not found in the modal.');
        }

        const crsInput = modal.querySelector('.modal-input.CRS');
        if (data.beneficiaryType === 'Widow/Widower') {
            crsInput.value = data.CRS5 || 'No CRS5 provided';
        } else if (data.beneficiaryType === 'Child/Brother/Sister') {
            crsInput.value = data.CRS4 || 'No CRS4 provided';
        } else {
            crsInput.value = 'No CRS data provided';
        }

        const inputs = modal.querySelectorAll('.modal-input');
        inputs.forEach(input => input.setAttribute('readonly', true));
        modal.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        console.log("No such document!");
    }
}


export async function openModalForUpdate(docId) {
    let currentDocId = docId;
    const modal = document.querySelector('.pensioner-modal');
    const overlay = document.querySelector('.overlay');

    // Show the modal and overlay
    modal.style.display = 'block';
    overlay.style.display = 'block';

    // Fetch the document by ID
    const docRef = doc(db, "users", docId);
    const docSnap = await getDoc(docRef);

    const submissionDateElement = document.getElementById('submissionDate');
    submissionDateElement.textContent = 'Submission Date: ';

    if (docSnap.exists()) {
        const data = docSnap.data();

        const viewButtons = modal.querySelectorAll('.idFileViewButton, .videoClipViewButton, .retOrderViewButton, .oathofAllegianceViewButton, .certofNaturalizationViewButton, .passportViewButton, .identificationDualCitizenViewButton');
        viewButtons.forEach(button => {
            button.disabled = true;
            button.textContent = 'Unavailable';
        });

        // Constructing birthday string
        let birthday = '';
        if (data.birthday && typeof data.birthday === 'object') {
            birthday = `${data.birthday.month || 'Unknown'} / ${data.birthday.day || 'Unknown'} / ${data.birthday.year || 'Unknown'}`;
        }

        // Populate modal fields
        modal.querySelector('.modal-input.fullName').value = data.fullName || '';
        modal.querySelector('.modal-input.pensionerStatus').value = data.pensionerStatus || '';
        modal.querySelector('.modal-input.beneficiaryType').value = data.beneficiaryType || '';
        modal.querySelector('.modal-input.serialNumber').value = data.serialNumber || '';
        modal.querySelector('.modal-input.localAddress').value = data.localAddress || '';
        modal.querySelector('.modal-input.birthday').value = birthday || '';
        modal.querySelector('.modal-input.phoneNumber').value = data.phoneNumber || '';
        modal.querySelector('.modal-input.abroadAddress').value = data.abroadAddress || '';

        if (data.submitTimestamp && data.submitTimestamp.toDate) {
            const submitDate = data.submitTimestamp.toDate();
            const options = { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: 'numeric', minute: 'numeric', second: 'numeric', 
                timeZoneName: 'short', hour12: true 
            };
            const formattedDate = submitDate.toLocaleString("en-US", options);
            submissionDateElement.textContent += formattedDate;
        } else {
            submissionDateElement.textContent += 'Not available';
        }
        submissionDateElement.style.color = 'red';

        let latestPictureUrl = 'assets/nopp.png';
        if (data['2x2Picture_files'] && Array.isArray(data['2x2Picture_files'])) {
            const latestPicture = data['2x2Picture_files'].sort((a, b) => b.timestamp - a.timestamp)[0];
            latestPictureUrl = latestPicture ? latestPicture.url : latestPictureUrl;
        }

        const imageElement = modal.querySelector('.modal-circle img');
        if (imageElement) {
            imageElement.src = latestPictureUrl;
        }

        const crsInput = modal.querySelector('.modal-input.CRS');
        if (data.beneficiaryType === 'Widow/Widower') {
            crsInput.value = data.CRS5 || 'No CRS5 provided';
        } else if (data.beneficiaryType === 'Child/Brother/Sister') {
            crsInput.value = data.CRS4 || 'No CRS4 provided';
        } else {
            crsInput.value = '';
        }

        const inputs = modal.querySelectorAll('.modal-input');
        inputs.forEach(input => input.removeAttribute('readonly'));

    } else {
        console.log("Document not found");
        return;
    }

    let submitButton = modal.querySelector('.submitUpdateButton');
    if (!submitButton) {
        submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.classList.add('submitUpdateButton');
        modal.querySelector('.modal-left').appendChild(submitButton);
    }
    submitButton.style.display = 'block';

    submitButton.onclick = async () => {
        if (confirm("Are you sure you want to update?")) {
            const updatedData = {
                fullName: modal.querySelector('.modal-input.fullName').value,
                pensionerStatus: modal.querySelector('.modal-input.pensionerStatus').value,
                beneficiaryType: modal.querySelector('.modal-input.beneficiaryType').value,
                serialNumber: modal.querySelector('.modal-input.serialNumber').value,
                localAddress: modal.querySelector('.modal-input.localAddress').value,
                phoneNumber: modal.querySelector('.modal-input.phoneNumber').value,
                abroadAddress: modal.querySelector('.modal-input.abroadAddress').value,
                birthday: {}
            };

            const beneficiaryType = modal.querySelector('.modal-input.beneficiaryType').value;
            if (beneficiaryType === 'Widow/Widower') {
                updatedData.CRS5 = modal.querySelector('.modal-input.CRS').value;
            } else if (beneficiaryType === 'Child/Brother/Sister') {
                updatedData.CRS4 = modal.querySelector('.modal-input.CRS').value;
            }

            const birthdayInputValue = modal.querySelector('.modal-input.birthday').value;
            const birthdayParts = birthdayInputValue.split('/');
            if (birthdayParts.length === 3) {
                updatedData.birthday = {
                    month: birthdayParts[0].trim(),
                    day: parseInt(birthdayParts[1].trim(), 10),
                    year: parseInt(birthdayParts[2].trim(), 10)
                };
            } else {
                alert('Please enter the birthday in "Month / DD / YYYY" format.');
                return;
            }

            try {
                const docRef = doc(db, "users", currentDocId);
                await updateDoc(docRef, updatedData);
                alert('Document successfully updated');
                closeModal();
            } catch (error) {
                console.error("Error updating document: ", error);
                alert('Failed to update the document');
            }
        }
    };
}

export function closeModal() {
    const modal = document.querySelector('.pensioner-modal');
    const overlay = document.querySelector('.overlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';

    const submitButton = document.querySelector('.submitUpdateButton');
    if (submitButton) {
        submitButton.style.display = 'none';
    }
}

// Add event listeners in a DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.overlay');
    overlay.addEventListener('click', closeModal);

    const closeButton = document.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
});