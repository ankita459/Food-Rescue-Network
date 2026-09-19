import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  addDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SurplusListing, ImpactStats, RescueMessage, UserProfile, BadgeId } from '../types';
import { INITIAL_TOP_RESCUERS } from '../data/seedData';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test Firestore connection on boot as mandated by security specification
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase client is offline. Verify network and configuration.');
      return false;
    }
    // A permission denied on a non-existent test document still proves connectivity to the server
    return true;
  }
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result?.user) {
      // Sync user profile to Firestore
      await syncUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (err: any) {
    console.error('Google Sign-In error:', err);
    throw err;
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Sync user profile document in /users/{uid}
export async function syncUserProfile(user: FirebaseUser): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'Rescue Volunteer',
        email: user.email || '',
        photoURL: user.photoURL || '',
        rescuesCount: 0,
        broadcastsCount: 0,
        createdAt: Date.now(),
      });
    }
  } catch (e) {
    console.warn('Error syncing user profile:', e);
  }
}

// Subscribe to real-time surplus listings
export function subscribeToSurplusListings(
  onData: (listings: SurplusListing[]) => void,
  onError?: (err: Error) => void
) {
  const listingsCol = collection(db, 'surplus_listings');
  return onSnapshot(
    listingsCol,
    (snapshot) => {
      const items: SurplusListing[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SurplusListing;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort newest first
      items.sort((a, b) => b.createdAt - a.createdAt);
      onData(items);
    },
    (error) => {
      console.warn('Error in surplus listings subscription:', error);
      if (onError) onError(error);
    }
  );
}

// Save or broadcast a new surplus listing to Firestore
export async function saveListingToFirestore(listing: SurplusListing): Promise<void> {
  const docRef = doc(db, 'surplus_listings', listing.id);
  await setDoc(docRef, listing);
}

// Update existing listing (e.g. status transition, claim lock, completion)
export async function updateListingInFirestore(
  listingId: string,
  updates: Partial<SurplusListing>
): Promise<void> {
  const docRef = doc(db, 'surplus_listings', listingId);
  await updateDoc(docRef, updates);
}

// Subscribe to aggregated civic impact stats
export function subscribeToImpactStats(
  onData: (stats: ImpactStats) => void,
  onError?: (err: Error) => void
) {
  const statsDocRef = doc(db, 'system_stats', 'impact_stats');
  return onSnapshot(
    statsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as ImpactStats);
      }
    },
    (error) => {
      console.warn('Error in impact stats subscription:', error);
      if (onError) onError(error);
    }
  );
}

// Update aggregated civic impact stats
export async function saveImpactStatsToFirestore(stats: ImpactStats): Promise<void> {
  const statsDocRef = doc(db, 'system_stats', 'impact_stats');
  await setDoc(statsDocRef, {
    ...stats,
    updatedAt: Date.now(),
  }, { merge: true });
}

// Initialize seed data into Firestore if collection is empty
export async function seedFirestoreIfEmpty(
  seedListings: SurplusListing[],
  seedStats: ImpactStats
): Promise<void> {
  try {
    const listingsCol = collection(db, 'surplus_listings');
    const existingListings = await getDocs(listingsCol);

    if (existingListings.empty) {
      console.log('Seeding initial surplus listings into Firestore...');
      const batch = writeBatch(db);

      seedListings.forEach((item) => {
        const itemRef = doc(db, 'surplus_listings', item.id);
        batch.set(itemRef, item);
      });

      const statsDocRef = doc(db, 'system_stats', 'impact_stats');
      batch.set(statsDocRef, {
        ...seedStats,
        updatedAt: Date.now(),
      });

      await batch.commit();
      console.log('Initial Firestore seeding complete.');
    }

    // Seed top rescuers in users collection if empty
    const usersCol = collection(db, 'users');
    const existingUsers = await getDocs(usersCol);
    if (existingUsers.empty) {
      console.log('Seeding initial community rescuers into Firestore...');
      const userBatch = writeBatch(db);
      INITIAL_TOP_RESCUERS.forEach((u) => {
        const userRef = doc(db, 'users', u.uid);
        userBatch.set(userRef, u);
      });
      await userBatch.commit();
      console.log('Initial community rescuers seeded.');
    }
  } catch (e) {
    console.warn('Seed verification notice:', e);
  }
}

// Subscribe to real-time top rescuers leaderboard from Firestore
export function subscribeToTopRescuers(
  onData: (rescuers: UserProfile[]) => void,
  onError?: (err: Error) => void
) {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const rescuers: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        rescuers.push({
          ...data,
          uid: docSnap.id,
          earnedBadges: data.earnedBadges || [],
          cheersCount: data.cheersCount || 0,
          rescuesCount: data.rescuesCount || 0,
          totalKgRescued: data.totalKgRescued || 0,
          mealsSaved: data.mealsSaved || 0,
        });
      });
      // Sort by completed rescues count descending
      rescuers.sort((a, b) => (b.rescuesCount || 0) - (a.rescuesCount || 0));
      onData(rescuers);
    },
    (error) => {
      console.warn('Error subscribing to top rescuers in Firestore:', error);
      if (onError) onError(error);
    }
  );
}

// Record a completed rescue and award dynamic gamification badges in Firestore
export async function recordUserRescueCompletion(
  uid: string,
  displayName: string,
  weightKg: number,
  meals: number,
  claimDurationMins: number,
  photoURL?: string,
  email?: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    let currentRescues = 0;
    let currentKg = 0;
    let currentMeals = 0;
    let fastestMins = claimDurationMins;
    let existingBadges: BadgeId[] = [];
    let cheers = 0;

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      currentRescues = data.rescuesCount || 0;
      currentKg = data.totalKgRescued || 0;
      currentMeals = data.mealsSaved || 0;
      fastestMins = Math.min(data.fastestClaimMinutes || 999, claimDurationMins);
      existingBadges = data.earnedBadges || [];
      cheers = data.cheersCount || 0;
    }

    const newRescues = currentRescues + 1;
    const newKg = currentKg + weightKg;
    const newMeals = currentMeals + meals;

    // Dynamically evaluate badges
    const newBadges = new Set<BadgeId>(existingBadges);
    if (newRescues >= 1) newBadges.add('first-rescue');
    if (fastestMins <= 10) newBadges.add('speed-demon');
    if (newRescues >= 3 || newKg >= 30) newBadges.add('community-anchor');
    if (newKg >= 50) newBadges.add('zero-waste-hero');

    await setDoc(
      userRef,
      {
        uid,
        displayName: displayName || 'Rescue Volunteer',
        email: email || '',
        photoURL: photoURL || '',
        rescuesCount: newRescues,
        totalKgRescued: newKg,
        mealsSaved: newMeals,
        fastestClaimMinutes: fastestMins,
        earnedBadges: Array.from(newBadges),
        lastActiveAt: Date.now(),
        cheersCount: cheers,
        createdAt: userSnap.exists() ? userSnap.data()?.createdAt || Date.now() : Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error updating rescuer profile in Firestore:', err);
  }
}

// Cheer a volunteer rescuer in Firestore (adds social appreciation)
export async function cheerVolunteerInFirestore(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentCheers = userSnap.data()?.cheersCount || 0;
      await updateDoc(userRef, { cheersCount: currentCheers + 1 });
    }
  } catch (e) {
    console.warn('Error cheering volunteer in Firestore:', e);
  }
}


// Subscribe to real-time rescue dispatch & handover coordination messages
export function subscribeToRescueMessages(
  listingId: string,
  onData: (messages: RescueMessage[]) => void,
  onError?: (err: Error) => void
) {
  const messagesCol = collection(db, 'surplus_listings', listingId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: RescueMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as RescueMessage;
        messages.push({
          ...data,
          id: docSnap.id,
        });
      });
      onData(messages);
    },
    (error) => {
      console.warn(`Error subscribing to rescue messages for ${listingId}:`, error);
      if (onError) onError(error);
    }
  );
}

// Send a handover coordination or dispatch status message to Firestore
export async function sendRescueMessage(
  listingId: string,
  message: Omit<RescueMessage, 'id'>
): Promise<string> {
  const messagesCol = collection(db, 'surplus_listings', listingId, 'messages');
  const docRef = await addDoc(messagesCol, {
    ...message,
    timestamp: message.timestamp || Date.now(),
  });
  return docRef.id;
}

