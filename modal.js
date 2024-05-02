export function openModal(){
window.openModal = async function(docId) {
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    const docRef = doc(db, "users", docId); // Ensure 'doc' and 'db' are correctly imported and initialized
    const docSnap = await getDoc(docRef);

    const submissionDateElement = document.getElementById('submissionDate');

    // Reset the submission date text content each time the modal is opened
    submissionDateElement.textContent = 'Submission Date: ';
        

    const submitButton = document.querySelector('.submitUpdateButton');
    if (submitButton) {
        submitButton.style.display = 'none'; // Hide the button
    }
        
        
    if (docSnap.exists()) {
        const data = docSnap.data();
        const submissionDateElement = document.getElementById('submissionDate');

        const idFileField = data.pensionerStatus === 'Principal' ? 'pensionID_files' : 'normalID_files';

        updateFileAvailability(modal, data, '.idFileViewButton', idFileField);
        updateFileAvailability(modal, data, '.videoClipViewButton', 'videoClip_files');
        updateFileAvailability(modal, data, '.retOrderViewButton', 'retOrder_files');
        updateFileAvailability(modal, data, '.oathofAllegianceViewButton', 'oathofAllegiance_files');
        updateFileAvailability(modal, data, '.certofNaturalizationViewButton', 'certofNaturalization_files');
        updateFileAvailability(modal, data, '.identificationDualCitizenViewButton', 'identificationDualCitizen_files');
        updateFileAvailability(modal, data, '.passportViewButton', 'passport_files');
        

        // Constructing the birthday string
        let birthday = 'No birthday provided';
        if (data.birthday && typeof data.birthday === 'object') {
            birthday = `${data.birthday.month || 'Unknown'} / ${data.birthday.day || 'Unknown'} / ${data.birthday.year || 'Unknown'}`;
        }
        

        // Set the values for your inputs
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
    // Specify your desired options for toLocaleString
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


        let latestPictureUrl = 'assets/nopp.png'; // default picture
    if (data['2x2Picture_files'] && Array.isArray(data['2x2Picture_files'])) {
        const latestPicture = data['2x2Picture_files'].sort((a, b) => b.timestamp - a.timestamp)[0];
        latestPictureUrl = latestPicture ? latestPicture.url : latestPictureUrl;
    }

    // Set the image source for the 2x2 Picture
    const imageElement = modal.querySelector('.modal-circle img');
    if (imageElement) {
        imageElement.src = latestPictureUrl;
    } else {
        console.error('Image element not found in the modal.');
    }

        // Conditionally display CRS4 or CRS5 based on the beneficiaryType
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
        // Display the modal and overlay
        modal.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        console.log("No such document!");
    }
}};

export function openModalForUpdate() {
window.openModalForUpdate = async function(docId) {

    let currentDocId = docId;
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');

    // Show the modal and overlay
    modal.style.display = 'block';
    overlay.style.display = 'block';

    // Fetch the document by ID
    const docRef = doc(db, "users", docId);
    const docSnap = await getDoc(docRef);

    const submissionDateElement = document.getElementById('submissionDate');

    // Reset the submission date text content each time the modal is opened
    submissionDateElement.textContent = 'Submission Date: ';

    // Check if the submit button already exists, create if it doesn't

    if (docSnap.exists()) {
        const data = docSnap.data();

        const viewButtons = modal.querySelectorAll('.idFileViewButton, .videoClipViewButton, .retOrderViewButton, .oathofAllegianceViewButton, .certofNaturalizationViewButton, .passportViewButton, .identificationDualCitizenViewButton');
        viewButtons.forEach(button => {
            button.disabled = true; // Disable the button
            button.textContent = 'Unavailable'; // Optionally change the button text
        });


        // Constructing the birthday string
        let birthday = '';
        if (data.birthday && typeof data.birthday === 'object') {
            birthday = `${data.birthday.month || 'Unknown'} / ${data.birthday.day || 'Unknown'} / ${data.birthday.year || 'Unknown'}`;
        }

        // Populate the modal's input fields with the data
        modal.querySelector('.modal-input.fullName').value = data.fullName || '';
        modal.querySelector('.modal-input.pensionerStatus').value = data.pensionerStatus || '';
        modal.querySelector('.modal-input.beneficiaryType').value = data.beneficiaryType || '';
        modal.querySelector('.modal-input.serialNumber').value = data.serialNumber || '';
        modal.querySelector('.modal-input.localAddress').value = data.localAddress || '';
        modal.querySelector('.modal-input.birthday').value = birthday || '';
        modal.querySelector('.modal-input.phoneNumber').value = data.phoneNumber || '';
        modal.querySelector('.modal-input.abroadAddress').value = data.abroadAddress || '';

        const submissionDateElement = document.getElementById('submissionDate');

    // Check if submitTimestamp exists and is a Firestore timestamp
    if (data.submitTimestamp && data.submitTimestamp.toDate) {
    const submitDate = data.submitTimestamp.toDate();
    // Specify your desired options for toLocaleString
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
        // Continue for other fields...
        // Setting the image source for the 2x2 Picture
        let latestPictureUrl = 'assets/nopp.png'; // default picture
    if (data['2x2Picture_files'] && Array.isArray(data['2x2Picture_files'])) {
        const latestPicture = data['2x2Picture_files'].sort((a, b) => b.timestamp - a.timestamp)[0];
        latestPictureUrl = latestPicture ? latestPicture.url : latestPictureUrl;
    }

    // Set the image source for the 2x2 Picture
    const imageElement = modal.querySelector('.modal-circle img');
    if (imageElement) {
        imageElement.src = latestPictureUrl;
    } else {
        console.error('Image element not found in the modal.');
    }

        const beneficiaryTypeInput = modal.querySelector('.modal-input.beneficiaryType');

        // Conditionally display CRS4 or CRS5 based on the beneficiaryType
        const crsInput = modal.querySelector('.modal-input.CRS');
        if (data.beneficiaryType === 'Widow/Widower') {
            crsInput.value = data.CRS5 || 'No CRS5 provided';
        } else if (data.beneficiaryType === 'Child/Brother/Sister') {
            crsInput.value = data.CRS4 || 'No CRS4 provided';
        } else {
            crsInput.value = '';
        }

        // Make the input fields editable
        const inputs = modal.querySelectorAll('.modal-input');
        inputs.forEach(input => input.removeAttribute('readonly'));
        modal.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        console.log("Document not found");
    }

    async function updateTable() {
    const tbody = document.getElementById('dataTable');
    tbody.innerHTML = ''; // Clear the existing table contents
    let stdNo = 0;

    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach(doc => {
        const data = doc.data();
        AddItemToTable(data.fullName, data.pensionerStatus, data.serialNumber, doc.id, ++stdNo, tbody);
    });
}

    let submitButton = modal.querySelector('.submitUpdateButton');
    if (!submitButton) {
        submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.classList.add('submitUpdateButton');
        modal.querySelector('.modal-left').appendChild(submitButton); // Assuming you want it in '.modal-left'
    }

    // Ensure the submit button is visible
    submitButton.style.display = 'block';

    submitButton.onclick = async () => {
        // Confirm and perform update here
        if (confirm("Are you sure you want to update?")) {

            const fullName = await getFullNameFromFirestore(currentDocId);
        if (!fullName) {
            alert('Unable to retrieve full name for logging.');
            return; // Stop the operation if fullName cannot be retrieved
        }
            // Perform update operation...
            const updatedData = {
                fullName: modal.querySelector('.modal-input.fullName').value,
                pensionerStatus: modal.querySelector('.modal-input.pensionerStatus').value,
                beneficiaryType: modal.querySelector('.modal-input.beneficiaryType').value,
                serialNumber: modal.querySelector('.modal-input.serialNumber').value,
                localAddress: modal.querySelector('.modal-input.localAddress').value,
                phoneNumber: modal.querySelector('.modal-input.phoneNumber').value,
                abroadAddress: modal.querySelector('.modal-input.abroadAddress').value,
                // Include other fields you want to update...
                birthday: {}, // Initialize birthday as an empty object
            };

            // Extract the beneficiary type
            const beneficiaryType = modal.querySelector('.modal-input.beneficiaryType').value;

            // Based on the beneficiary type, update CRS4 or CRS5
            if (beneficiaryType === 'Widow/Widower') {
                updatedData.CRS5 = modal.querySelector('.modal-input.CRS').value; // Assuming you have an input field for CRS
            } else if (beneficiaryType === 'Child/Brother/Sister') {
                updatedData.CRS4 = modal.querySelector('.modal-input.CRS').value; // Assuming you have an input field for CRS
            }


            const birthdayInputValue = modal.querySelector('.modal-input.birthday').value;
            const birthdayParts = birthdayInputValue.split('/');

            if (birthdayParts.length === 3) {
                const monthString = birthdayParts[0].trim(); // Assuming the month is entered as a string, e.g., 'January'
                const day = parseInt(birthdayParts[1].trim(), 10);
                const year = parseInt(birthdayParts[2].trim(), 10);

                // You may want to add additional validation here to ensure the monthString is a valid month

                updatedData.birthday = {
                    month: monthString,
                    day: day,
                    year: year
                };
            } else {
                // Handle error for incorrect date format or notify the user
                alert('Please enter the birthday in "Month / DD / YYYY" format.');
                return; // Don't proceed with the update
            }

            // Firestore document reference
            const docRef = doc(db, "users", currentDocId);

            // Update the document in Firestore
            try {
    await updateDoc(docRef, updatedData);
    alert('Document successfully updated');
    logAction(`UPDATED the data of ${fullName} | Document ID: ${currentDocId}`, sessionStorage.getItem("fullName"));
    closeModal(); // Close the modal upon successful update
    await loadTableData(); // Refresh the dashboard table
    showRows(); // Enforce pagination display rules
} catch (error) {
    console.error("Error updating document: ", error);
    alert('Failed to update the document');
}
        }
    };
}};
export function closeModal(){
    window.closeModal = function() {
        const modal = document.querySelector('.modal');
        const overlay = document.querySelector('.overlay');
        modal.style.display = 'none';
        overlay.style.display = 'none';

        const submitButton = document.querySelector('.submitUpdateButton');
    if (submitButton) {
        submitButton.style.display = 'none';
    }
}};

export function setupModalEventListeners() {
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    // Setup event listeners for any other elements that should trigger modal functions
}