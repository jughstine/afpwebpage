import { app, db, auth, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp, writeBatch, deleteUser, getFirestore } from './firebaseConfig.js';

export async function checkForExistingEntries(phoneNumber, email) {
    // Ensure the phone number starts with "09" and is exactly 11 digits long
    if (!/^09\d{9}$/.test(phoneNumber)) {
        alert('Phone number must start with "09" and be 11 digits long.');
        return true; // Prevent further execution
    }

    // Ensure email is in a valid format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return true;
    }

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

export async function createAccount(fullName, phoneNumber, email, password) {
    // Validate input fields
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) {
        alert('All fields are required.');
        return;
    }

    // Check if phone number and email already exist
    const exists = await checkForExistingEntries(phoneNumber, email);
    if (exists) return;

    try {
        const accountsRef = collection(db, 'accounts');
        await addDoc(accountsRef, {
            fullName,
            phoneNumber,
            email,
            password, // Ideally, hash the password before storing
            createdAt: Timestamp.now()
        });
        alert('Account successfully created.');
    } catch (error) {
        console.error('Error creating account:', error);
        alert('Error creating account. Please try again.');
    }
}

export async function updateAccount(selectedAccountId, updatedData) {
    if (!selectedAccountId) {
        alert('No account selected for update.');
        return;
    }

    // Validate phone number if updating it
    if (updatedData.phoneNumber && !/^09\d{9}$/.test(updatedData.phoneNumber)) {
        alert('Phone number must start with "09" and be 11 digits long.');
        return;
    }

    // Validate email if updating it
    if (updatedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedData.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Check if updated phone number or email already exists
    if (updatedData.phoneNumber || updatedData.email) {
        const exists = await checkForExistingEntries(updatedData.phoneNumber || "", updatedData.email || "");
        if (exists) return;
    }

    try {
        const accountRef = doc(db, 'accounts', selectedAccountId);
        await updateDoc(accountRef, updatedData);
        alert('Account successfully updated.');
    } catch (error) {
        console.error('Error updating account:', error);
        alert('Error updating account. Please try again.');
    }
}
