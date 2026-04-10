import { DailyData } from '../types';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

const STORAGE_PREFIX = 'plan_focus_data_';
const SETTINGS_KEY = 'plan_focus_settings';

export const createEmptyDailyData = (date: string): DailyData => ({
  date,
  schedule: [],
  todos: [],
  focusMinutes: 0,
});

let cachedAllData: DailyData[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute

export const saveDailyData = async (data: DailyData): Promise<void> => {
  cachedAllData = null; // Invalidate cache
  const user = auth.currentUser;
  if (user) {
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyData', data.date);
      await setDoc(docRef, { ...data, uid: user.uid });
    } catch (error) {
      console.error("Failed to save data to Firestore", error);
    }
  } else {
    // Fallback to local storage if not logged in
    try {
      const key = `${STORAGE_PREFIX}${data.date}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data", error);
    }
  }
};

export const loadDailyData = async (date: string): Promise<DailyData> => {
  const user = auth.currentUser;
  if (user) {
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyData', date);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as DailyData;
        if (!data.schedule) data.schedule = [];
        if (!data.todos) data.todos = [];
        return data;
      }
    } catch (error) {
      console.error("Failed to load data from Firestore", error);
    }
  } else {
    // Fallback to local storage
    const key = `${STORAGE_PREFIX}${date}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.schedule) parsed.schedule = [];
        if (!parsed.todos) parsed.todos = [];
        return parsed;
      } catch (e) {
        console.error("Data corruption", e);
      }
    }
  }
  return createEmptyDailyData(date);
};

export const getAllDailyData = async (forceRefresh = false): Promise<DailyData[]> => {
  const now = Date.now();
  if (!forceRefresh && cachedAllData && now - lastFetchTime < CACHE_TTL) {
    return cachedAllData;
  }

  const allData: DailyData[] = [];
  const user = auth.currentUser;
  
  if (user) {
    try {
      const colRef = collection(db, 'users', user.uid, 'dailyData');
      const querySnapshot = await getDocs(colRef);
      querySnapshot.forEach((doc) => {
        allData.push(doc.data() as DailyData);
      });
    } catch (error) {
      console.error("Failed to get all data from Firestore", error);
    }
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            allData.push(JSON.parse(item));
          }
        } catch (e) {}
      }
    }
  }
  
  cachedAllData = allData;
  lastFetchTime = now;
  return allData;
};

export const getStoredDates = async (): Promise<string[]> => {
  const dates: string[] = [];
  const user = auth.currentUser;
  
  if (user) {
    try {
      const colRef = collection(db, 'users', user.uid, 'dailyData');
      const querySnapshot = await getDocs(colRef);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DailyData;
        if (data.focusMinutes > 0 || (data.schedule && data.schedule.length > 0) || (data.todos && data.todos.length > 0)) {
          if (data.date) dates.push(data.date);
        }
      });
    } catch (error) {
      console.error("Failed to get stored dates from Firestore", error);
    }
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
               const data = JSON.parse(item);
               if (data.focusMinutes > 0 || (data.schedule && data.schedule.length > 0) || (data.todos && data.todos.length > 0)) {
                   if (data.date) dates.push(data.date);
               }
          }
        } catch (e) {}
      }
    }
  }
  return dates;
};

// Export/Import
export const exportAllData = async (): Promise<void> => {
  const allData: Record<string, any> = {};
  const user = auth.currentUser;

  if (user) {
    try {
      const colRef = collection(db, 'users', user.uid, 'dailyData');
      const querySnapshot = await getDocs(colRef);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DailyData;
        if (data.date) {
          allData[`${STORAGE_PREFIX}${data.date}`] = data;
        }
      });
    } catch (error) {
      console.error("Failed to export data from Firestore", error);
    }
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_PREFIX) || key === SETTINGS_KEY)) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {}
      }
    }
  }
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `plan_focus_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importData = async (file: File, onSuccess: () => void): Promise<void> => {
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const json = JSON.parse(event.target?.result as string);
      const user = auth.currentUser;

      if (user) {
        for (const key of Object.keys(json)) {
          if (key.startsWith(STORAGE_PREFIX)) {
            const data = json[key] as DailyData;
            if (data.date) {
              const docRef = doc(db, 'users', user.uid, 'dailyData', data.date);
              await setDoc(docRef, { ...data, uid: user.uid });
            }
          }
        }
      } else {
        Object.keys(json).forEach((key) => {
          if (key.startsWith(STORAGE_PREFIX) || key === SETTINGS_KEY) {
            localStorage.setItem(key, JSON.stringify(json[key]));
          }
        });
      }
      alert(`数据恢复成功`);
      onSuccess();
    } catch (e) {
      alert("文件格式错误");
    }
  };
  reader.readAsText(file);
};