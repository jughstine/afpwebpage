import {  app, db, auth, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp, writeBatch, deleteUser, getFirestore  } from './firebaseConfig.js';

export async function checkForExistingEntries(phoneNumber, email) {
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
    // Implementation of account creation
}

export async function updateAccount(selectedAccountId, updatedData) {
    // Implementation of account update
}