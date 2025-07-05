import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { db } from './firebase'; // Your existing database connection
import { collection, doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";


// --- Helper Function to get the last 7 dates ---
// It returns an array of objects, e.g., [{ date: Date, id: "2025-07-05" }]
const getLast7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push({ date: d, id: `${year}-${month}-${day}` });
    }
    return dates;
};

const App = () => {
    // State to hold the log of taken medicines, e.g., {"2025-07-05": true}
    const [takenLog, setTakenLog] = useState({});
    const sevenDays = getLast7Days();
    const todayId = sevenDays[0].id;

    // useEffect hook to listen for real-time data from Firestore
    useEffect(() => {
        // Listen to the 'dailyLog' collection for changes
        const unsubscribe = onSnapshot(collection(db, "dailyLog"), (snapshot) => {
            const newLog = {};
            snapshot.docs.forEach(doc => {
                newLog[doc.id] = true; // If a doc exists for a date, it was taken
            });
            setTakenLog(newLog);
        });

        // Cleanup subscription when the component unmounts
        return () => unsubscribe();
    }, []);

    // Function to confirm today's medicine was taken
    const handleConfirm = async () => {
        const todayDocRef = doc(db, "dailyLog", todayId);
        await setDoc(todayDocRef, { takenAt: new Date() });
    };
    
    // Function to undo a confirmation
    const handleUndo = async (dateId) => {
        const docRef = doc(db, "dailyLog", dateId);
        await deleteDoc(docRef);
    }

    // --- The component's appearance (JSX) ---
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Daily Medicine Log</h1>
                <p style={styles.subtitle}>Just one pill, every day.</p>
            </header>
            
            <div style={styles.logList}>
                {sevenDays.map(({ date, id }) => {
                    const isTaken = takenLog[id];
                    const isToday = id === todayId;

                    return (
                        <div key={id} style={styles.logEntry}>
                            <div style={styles.dateInfo}>
                                <span style={styles.dayOfWeek}>{date.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                                <span style={styles.fullDate}>{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div style={styles.statusSection}>
                                {isTaken ? (
                                    <>
                                        <span style={styles.takenText}>✔ Taken</span>
                                        <button onClick={() => handleUndo(id)} style={styles.undoButton}>Undo</button>
                                    </>
                                ) : (
                                    isToday ? (
                                        <button onClick={handleConfirm} style={styles.confirmButton}>Confirm Intake</button>
                                    ) : (
                                        <span style={styles.missedText}>- Missed</span>
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Styling for the application ---
const styles = {
    container: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        backgroundColor: '#f4f7f9',
        minHeight: '100vh',
        padding: '20px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    title: {
        color: '#2c3e50',
        fontWeight: 700,
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '1.1rem',
    },
    logList: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
    },
    logEntry: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid #ecf0f1',
    },
    dateInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    dayOfWeek: {
        fontWeight: 600,
        color: '#34495e',
        fontSize: '1rem',
    },
    fullDate: {
        color: '#95a5a6',
        fontSize: '0.9rem',
    },
    statusSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    takenText: {
        color: '#27ae60',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
    missedText: {
        color: '#bdc3c7',
        fontStyle: 'italic',
    },
    confirmButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#3498db',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    undoButton: {
        padding: '8px 15px',
        border: '1px solid #e74c3c',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        color: '#e74c3c',
        cursor: 'pointer',
        transition: 'background-color 0.2s, color 0.2s',
    },
};

// --- Standard React rendering ---
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
