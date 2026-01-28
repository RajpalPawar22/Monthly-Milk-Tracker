'use client';

import { useState, useEffect } from 'react';
import { ClayCard } from './components/ClayCard/ClayCard';
import { BubblyButton } from './components/BubblyButton/BubblyButton';
import Image from 'next/image';

type Entry = {
  date: string;
  amount: number; // 0 for no milk
  status: 'confirmed' | 'rejected' | 'modified';
};

const translations = {
  en: {
    title: 'Daily Doodh',
    todayTab: 'Today',
    calendarTab: 'Calendar',
    statsTab: 'Stats',
    didMilkArrive: 'Did the milk arrive today?',
    yes1L: 'Yes, Normal', // will append amount dynamically
    noMilk: 'No Milk Today',
    savedYes: '✅ Saved: Added for today!',
    savedNo: '❌ Saved: No milk today.',
    thisMonth: 'This Month',
    clickEdit: 'Click a day to edit',
    monthlyBill: 'Monthly Bill',
    estBill: 'Estimated Bill',
    totalMilk: 'Total Milk This Month',
    settings: 'Settings',
    pricePerLiter: 'Price per Liter (₹)',
    defaultAmount: 'Default Amount (L)',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    editTitle: 'Edit',
    yesOption: 'Yes, Normal',
    noOption: 'No Milk (0L)',
    cancel: 'Cancel',
    save: 'Save',

    customAmount: 'Custom Amount (L)',
    arrivalTime: 'Milk Arrival Time',
    reminderTitle: 'Did the milk arrive?',
    reminderBody: 'Don\'t forget to log it! 🐮',
    testNotification: 'Test Notification',
    statsDashboard: {
      title: 'Monthly Snapshot',
      daysTaken: 'Days Taken',
      daysMissed: 'Days Missed',
      totalLiters: 'Total Liters',
      estCost: 'Est. Cost'
    }
  },
  hi: {
    title: 'डेली दूध',
    todayTab: 'आज',
    calendarTab: 'कैलेंडर',
    statsTab: 'आंकड़े',
    didMilkArrive: 'क्या आज दूध आया?',
    yes1L: 'हाँ, सामान्य',
    noMilk: 'आज दूध नहीं आया',
    savedYes: '✅ सुरक्षित: आज के लिए जोड़ा गया!',
    savedNo: '❌ सुरक्षित: आज कोई दूध नहीं।',
    thisMonth: 'इस महीने',
    clickEdit: 'बदलने के लिए तारीख चुनें',
    monthlyBill: 'मासिक बिल',
    estBill: 'अनुमानित बिल',
    totalMilk: 'इस महीने कुल दूध',
    settings: 'सेटिंग्स',
    pricePerLiter: 'प्रति लीटर कीमत (₹)',
    defaultAmount: 'सामान्य मात्रा (L)',
    theme: 'थीम',
    language: 'भाषा',
    light: 'लाइट',
    dark: 'डार्क',
    editTitle: 'बदलाव करें',
    yesOption: 'हाँ, सामान्य',
    noOption: 'दूध नहीं (0L)',
    cancel: 'रद्द करें',
    save: 'सुरक्षित करें',
    customAmount: 'कस्टम मात्रा (L)',
    arrivalTime: 'दूध आने का समय',
    reminderTitle: 'क्या दूध आया?',
    reminderBody: 'इसे लिखना न भूलें! 🐮',
    testNotification: 'नोटिफिकेशन टेस्ट करें',
    statsDashboard: {
      title: 'मासिक रिपोर्ट',
      daysTaken: 'दूध लिया',
      daysMissed: 'नहीं लिया',
      totalLiters: 'कुल लीटर',
      estCost: 'अनुमानित खर्च'
    }
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'stats'>('today');
  // Navigation State
  const [viewDate, setViewDate] = useState(new Date());

  // Notification State
  const [milkTime, setMilkTime] = useState('08:00');
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Data State
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [pricePerLiter, setPricePerLiter] = useState<number>(60); // Default 60
  const [defaultAmount, setDefaultAmount] = useState<number>(1); // Default 1L
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [showCow, setShowCow] = useState(false);

  // Edit State
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Language State
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');
  const t = translations[language];

  // Initialize Theme & Language & Default Amount
  useEffect(() => {
    const savedTheme = localStorage.getItem('daily-doodh-theme');
    const savedLang = localStorage.getItem('daily-doodh-lang');
    const savedDefault = localStorage.getItem('daily-doodh-default');

    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.body.classList.add('dark');
    }

    if (savedLang === 'en' || savedLang === 'hi') {
      setLanguage(savedLang);
    }

    if (savedDefault) {
      setDefaultAmount(parseFloat(savedDefault));
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark', newMode);
    localStorage.setItem('daily-doodh-theme', newMode ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    localStorage.setItem('daily-doodh-lang', newLang);
  };

  // Request Notification Permissions on Load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Notification Logic (Interval)
  useEffect(() => {
    const interval = setInterval(() => {
      // Logic: Check every minute
      checkNotification();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [milkTime, entries]); // Re-run if milkTime or entries change (to have fresh state)

  const checkNotification = () => {
    if (notificationPermission !== 'granted') return;

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');

    // 1. Check if entry exists for today
    if (entries[todayStr]) return; // Already logged

    // 2. Check Time
    const [hours, minutes] = milkTime.split(':').map(Number);
    const arrivalTime = new Date();
    arrivalTime.setHours(hours, minutes, 0, 0);

    const reminderTime = new Date(arrivalTime.getTime() + 10 * 60000); // +10 minutes

    if (now >= reminderTime) {
      // 3. Check if already notified today
      const lastNotifyDate = localStorage.getItem('daily-doodh-last-notify');
      if (lastNotifyDate === todayStr) return; // Already notified today

      // SEND NOTIFICATION
      sendNotification();
      localStorage.setItem('daily-doodh-last-notify', todayStr);
    }
  };

  const sendNotification = async () => {
    // 1. Check support
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return;
    }

    // 2. Request permission if not granted
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== 'granted') {
        alert('Permission denied! Please enable notifications for this site in your browser settings.');
        return;
      }
    }

    // 3. Send Notification
    try {
      new Notification(t.reminderTitle, {
        body: t.reminderBody,
        icon: '/assets/cow-icon.png'
      });
      // Optional: Feedback for testing
      // alert('Sent! Check your notification center.'); 
    } catch (e) {
      console.error('Notification Error:', e);
      alert('Failed to send notification. Check console for details.');
    }
  };


  // Load Initial Data
  useEffect(() => {
    const savedEntries = localStorage.getItem('daily-doodh-entries');
    const savedPrice = localStorage.getItem('daily-doodh-price');
    const savedTime = localStorage.getItem('daily-doodh-time');

    if (savedPrice) {
      setPricePerLiter(Number(savedPrice));
    }
    if (savedTime) {
      setMilkTime(savedTime);
    }

    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries);
      setEntries(parsedEntries);
      calculateMonthTotal(parsedEntries);
    }
  }, []);

  const calculateMonthTotal = (data: Record<string, Entry>, dateOfInterest: Date = new Date()) => {
    const targetMonth = dateOfInterest.getMonth();
    const targetYear = dateOfInterest.getFullYear();
    let total = 0;
    Object.values(data).forEach((entry: Entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear) {
        total += entry.amount;
      }
    });
    setMonthTotal(total);
  };

  // Recalculate when viewDate changes
  useEffect(() => {
    calculateMonthTotal(entries, viewDate);
  }, [viewDate, entries]);

  const changeMonth = (increment: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setViewDate(newDate);
  };


  const saveEntry = (date: string, type: 'confirmed' | 'rejected', amount: number) => {
    const newEntry: Entry = { date, amount, status: type };

    // Update State
    const updatedEntries = { ...entries, [date]: newEntry };
    setEntries(updatedEntries);

    // Save to LocalStorage
    localStorage.setItem('daily-doodh-entries', JSON.stringify(updatedEntries));

    // Update Totals
    calculateMonthTotal(updatedEntries, viewDate);

    // Clear editing state
    setEditingDate(null);
  };

  /* Removed toggleLanguage function since it's now in settings */

  const handleDefaultAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value);
    if (!isNaN(newAmount) && newAmount > 0) {
      setDefaultAmount(newAmount);
      localStorage.setItem('daily-doodh-default', String(newAmount));
    }
  };

  const today = new Date().toLocaleDateString('en-CA');
  const todayEntry = entries[today];

  // Calendar Logic
  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    // Empty slots for start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      // Use local-friendly YYYY-MM-DD
      const dateString = d.toLocaleDateString('en-CA');
      days.push({ day: i, date: dateString });
    }
    return days;
  };

  const calendarDays = getDaysInMonth();

  return (
    <main className="container">
      <header style={{
        marginBottom: '10px',
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Header content similar to before but removed language toggle button from here as it moved to settings */}
        <button
          onClick={toggleTheme} // Keeping quick toggle for theme in header nicely
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--card-bg)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/assets/cow-icon.png"
            alt="Cow Logo"
            width={50}
            height={50}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              animation: 'headBob 2s ease-in-out infinite alternate'
            }}
          />
          <h1 style={{
            fontSize: '2.5rem',
            color: 'var(--text-main)',
            fontFamily: "'Fredoka', sans-serif"
          }}>
            {t.title}
          </h1>
        </div>
      </header>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('today')}
          className={`clay-btn ${activeTab === 'today' ? '' : 'outline'}`}
          style={{ padding: '12px', fontSize: '0.9rem', flex: 1 }}
        >
          {t.todayTab}
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`clay-btn ${activeTab === 'calendar' ? '' : 'outline'}`}
          style={{ padding: '12px', fontSize: '0.9rem', flex: 1 }}
        >
          {t.calendarTab}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`clay-btn ${activeTab === 'stats' ? '' : 'outline'}`}
          style={{ padding: '12px', fontSize: '0.9rem', flex: 1 }}
        >
          {t.statsTab}
        </button>
      </div>

      {activeTab === 'today' && (
        <>
          {/* Vibe Check Animation */}
          <div
            style={{
              position: 'fixed',
              bottom: showCow ? '-10px' : '-350px',
              right: '50%',
              transform: 'translateX(50%)',
              transition: 'bottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 100,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
            }}
          >
            <Image
              src="/assets/cow-3d.png"
              alt="Happy Cow"
              width={280}
              height={280}
              priority
              style={{
                animation: showCow ? 'happyCowDance 1s ease infinite' : 'none'
              }}
            />
          </div>

          {/* Stats Dashboard */}
          <div style={{ marginBottom: '20px', width: '100%' }}>
            <ClayCard title={t.statsDashboard.title}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.statsDashboard.daysTaken}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {Object.values(entries).filter(e => {
                      const d = new Date(e.date);
                      return d.getMonth() === new Date().getMonth() && e.amount > 0;
                    }).length}
                  </div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.statsDashboard.daysMissed}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                    {Object.values(entries).filter(e => {
                      const d = new Date(e.date);
                      return d.getMonth() === new Date().getMonth() && e.amount === 0;
                    }).length}
                  </div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.statsDashboard.totalLiters}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    {monthTotal} L
                  </div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.statsDashboard.estCost}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    ₹{monthTotal * pricePerLiter}
                  </div>
                </div>
              </div>
            </ClayCard>
          </div>

          <ClayCard title={t.didMilkArrive}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>

              <div style={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}>
                <BubblyButton
                  onClick={() => {
                    saveEntry(today, 'confirmed', defaultAmount);
                    setShowCow(true);
                    setTimeout(() => setShowCow(false), 3000);
                  }}
                  variant="primary"
                  style={{ fontSize: '1.4rem', padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      /* Removed background circle to let transparent icon shine */
                      padding: '2px'
                    }}>
                      <Image src="/assets/milk-icon.png" alt="Milk" width={48} height={48} />
                    </div>
                    <span>{t.yes1L} ({defaultAmount}L)</span>
                  </div>
                </BubblyButton>
              </div>

              <BubblyButton onClick={() => saveEntry(today, 'rejected', 0)} variant="secondary">
                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>❌</span>
                {t.noMilk}
              </BubblyButton>

              {/* Custom Amount Input for Today */}
              <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {t.customAmount}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    id="today-custom-amount"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      fontSize: '1.1rem',
                      background: 'rgba(255,255,255,0.5)'
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('today-custom-amount') as HTMLInputElement;
                      const val = parseFloat(input.value);
                      if (!isNaN(val) && val >= 0) {
                        saveEntry(today, val > 0 ? 'confirmed' : 'rejected', val);
                        if (val > 0) {
                          setShowCow(true);
                          setTimeout(() => setShowCow(false), 3000);
                        }
                      }
                    }}
                    className="clay-btn"
                    style={{ width: 'auto', padding: '12px 24px', fontSize: '1rem', minWidth: '100px' }}
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </div>
          </ClayCard>

          {todayEntry && (
            <div
              className="clay-card"
              style={{
                marginTop: '24px',
                textAlign: 'center',
                color: 'var(--text-main)',
                fontWeight: '600',
                animation: 'fadeIn 0.5s ease'
              }}
            >
              {todayEntry.status === 'confirmed'
                ? t.savedYes
                : t.savedNo}
            </div>
          )}
        </>
      )}

      {activeTab === 'calendar' && (
        <ClayCard title="">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button
              onClick={() => changeMonth(-1)}
              className="clay-btn"
              style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.2rem', borderRadius: '50%' }}
            >
              {'<'}
            </button>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {viewDate.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="clay-btn"
              style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.2rem', borderRadius: '50%' }}
            >
              {'>'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '16px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)' }}>{d}</div>
            ))}

            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} />;
              const entry = entries[day.date];
              const isToday = day.date === today;
              const isFuture = day.date > today;

              let bg = 'rgba(255,255,255,0.5)';
              let border = 'none';
              let textColor = 'var(--text-main)';

              if (isToday) border = '2px solid var(--color-primary)';

              if (entry) {
                if (entry.amount > 0) {
                  // Check if abnormal amount
                  if (entry.amount !== defaultAmount) {
                    bg = 'var(--text-main)'; // Highlight abnormal
                    // If bg is text-main (Dark in Light Mode, Light in Dark Mode), invert text
                    textColor = darkMode ? '#000' : '#fff';
                  } else {
                    bg = 'var(--color-primary)'; // Normal green
                    // Normal green needs dark text in light mode
                    textColor = darkMode ? '#fff' : '#1f2937';
                  }
                }
                else {
                  bg = 'var(--color-secondary)'; // Red
                  textColor = '#fff'; // Red always looks good with white
                }
              }

              const isDisabled = isFuture;

              return (
                <button
                  key={i}
                  disabled={isDisabled}
                  onClick={() => setEditingDate(day.date)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: entry ? bg : 'var(--card-bg)',
                    borderRadius: '12px',
                    border: border,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: entry ? textColor : 'var(--text-main)',
                    position: 'relative',
                    boxShadow: isDisabled ? 'none' : 'var(--card-shadow)',
                    opacity: isDisabled ? 0.3 : 1
                  }}
                >
                  {day.day}
                  {entry && (
                    <div style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: '500' }}>
                      {entry.amount}L
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t.clickEdit}
          </div>
        </ClayCard>
      )}

      {activeTab === 'stats' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ClayCard title="">
            {/* Navigation for Bill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => changeMonth(-1)}
                className="clay-btn"
                style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.2rem', borderRadius: '50%' }}
              >
                {'<'}
              </button>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {t.monthlyBill}: {viewDate.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="clay-btn"
                style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.2rem', borderRadius: '50%' }}
              >
                {'>'}
              </button>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t.estBill}</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{monthTotal * pricePerLiter}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t.totalMilk}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {monthTotal} Liters
                </div>
              </div>
            </div>
          </ClayCard>

          <ClayCard title={t.settings}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Price Per Liter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.pricePerLiter}</label>
                <input
                  type="number"
                  value={pricePerLiter}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value);
                    setPricePerLiter(newPrice);
                    localStorage.setItem('daily-doodh-price', String(newPrice));
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'rgba(0,0,0,0.05)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              {/* Milk Arrival Time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.arrivalTime}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {/* Hour */}
                    <select
                      value={(() => {
                        const [h] = milkTime.split(':').map(Number);
                        const hour12 = h % 12 || 12;
                        return hour12;
                      })()}
                      onChange={(e) => {
                        const newH12 = parseInt(e.target.value);
                        const [currentH, currentM] = milkTime.split(':').map(Number);
                        const isPM = currentH >= 12;
                        let newH24 = newH12;

                        if (isPM && newH12 !== 12) newH24 += 12;
                        if (!isPM && newH12 === 12) newH24 = 0;

                        const newTime = `${String(newH24).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
                        setMilkTime(newTime);
                        localStorage.setItem('daily-doodh-time', newTime);
                      }}
                      style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(0,0,0,0.05)', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span style={{ fontWeight: 'bold' }}>:</span>
                    {/* Minute */}
                    <select
                      value={milkTime.split(':')[1]}
                      onChange={(e) => {
                        const [currentH] = milkTime.split(':');
                        const newTime = `${currentH}:${e.target.value}`;
                        setMilkTime(newTime);
                        localStorage.setItem('daily-doodh-time', newTime);
                      }}
                      style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(0,0,0,0.05)', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}
                    >
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {/* AM/PM */}
                    <select
                      value={parseInt(milkTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                      onChange={(e) => {
                        const [currentH, currentM] = milkTime.split(':').map(Number);
                        const isPM = e.target.value === 'PM';
                        let newH = currentH;

                        if (isPM && currentH < 12) newH += 12;
                        if (!isPM && currentH >= 12) newH -= 12;

                        const newTime = `${String(newH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
                        setMilkTime(newTime);
                        localStorage.setItem('daily-doodh-time', newTime);
                      }}
                      style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(0,0,0,0.05)', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <button
                    onClick={sendNotification}
                    className="clay-btn"
                    style={{ width: 'auto', padding: '0 16px', fontSize: '1.2rem' }}
                    title={t.testNotification}
                  >
                    🔔
                  </button>
                </div>
              </div>

              {/* Default Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.defaultAmount}</label>
                <input
                  type="number"
                  value={defaultAmount}
                  onChange={handleDefaultAmountChange}
                  step="0.5"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'rgba(0,0,0,0.05)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              {/* Language */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.language}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { setLanguage('en'); localStorage.setItem('daily-doodh-lang', 'en'); }}
                    className={`clay-btn ${language === 'en' ? '' : 'outline'}`}
                    style={{ padding: '12px', fontSize: '1rem' }}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); localStorage.setItem('daily-doodh-lang', 'hi'); }}
                    className={`clay-btn ${language === 'hi' ? '' : 'outline'}`}
                    style={{ padding: '12px', fontSize: '1rem' }}
                  >
                    Hindi
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.theme}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setDarkMode(false);
                      document.body.classList.remove('dark');
                      localStorage.setItem('daily-doodh-theme', 'light');
                    }}
                    className={`clay-btn ${!darkMode ? '' : 'outline'}`}
                    style={{ padding: '12px', fontSize: '1rem' }}
                  >
                    {t.light}
                  </button>
                  <button
                    onClick={() => {
                      setDarkMode(true);
                      document.body.classList.add('dark');
                      localStorage.setItem('daily-doodh-theme', 'dark');
                    }}
                    className={`clay-btn ${darkMode ? '' : 'outline'}`}
                    style={{ padding: '12px', fontSize: '1rem' }}
                  >
                    {t.dark}
                  </button>
                </div>
              </div>

            </div>
          </ClayCard>
        </div>
      )}

      {/* EDIT MODAL Overlay */}
      {editingDate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <ClayCard title={`${t.editTitle}: ${editingDate}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <BubblyButton onClick={() => saveEntry(editingDate!, 'confirmed', defaultAmount)}>
                  {t.yesOption} ({defaultAmount}L)
                </BubblyButton>
                <BubblyButton onClick={() => saveEntry(editingDate!, 'rejected', 0)} variant="secondary">
                  {t.noOption}
                </BubblyButton>

                {/* Custom Amount Input */}
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {t.customAmount}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      id="custom-amount-input"
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        fontSize: '1.1rem',
                        background: 'rgba(255,255,255,0.5)'
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('custom-amount-input') as HTMLInputElement;
                        const val = parseFloat(input.value);
                        if (!isNaN(val) && val >= 0) {
                          saveEntry(editingDate!, val > 0 ? 'confirmed' : 'rejected', val);
                        }
                      }}
                      className="clay-btn"
                      style={{ width: 'auto', padding: '12px 24px', fontSize: '1rem' }}
                    >
                      {t.save}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setEditingDate(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '1rem',
                      textDecoration: 'underline',
                      marginTop: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes happyCowDance {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(-5deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }

        @keyframes headBob {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(15deg); }
        }

        /* Fix for select dropdown visibility in Dark Mode */
        select option {
          color: #000;
          background: #fff;
        }
      `}</style>
    </main>
  );
}
