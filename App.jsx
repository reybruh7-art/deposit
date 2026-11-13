import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyB0V6DnuTc8L2Y50wFfyzH5fydhx2DSDEM",
  authDomain: "deposit-cf8a4.firebaseapp.com",
  projectId: "deposit-cf8a4",
  storageBucket: "deposit-cf8a4.firebasestorage.app",
  messagingSenderId: "1099129729826",
  appId: "1:1099129729826:web:d40eee60b40c6ebd1d6b79",
  measurementId: "G-DEEPY7GGDF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function DepositManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [childName, setChildName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "deposits"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!childName || !parentPhone || !depositAmount) return;

    try {
      await addDoc(collection(db, "deposits"), {
        childName,
        parentPhone,
        deposit: Number(depositAmount),
        lastUpdated: '-'
      });
      setChildName('');
      setParentPhone('');
      setDepositAmount('');
      fetchStudents();
    } catch (error) {
      console.error("Gagal menambah data:", error);
    }
  };

  const handleCutSessionAndWhatsApp = async (student) => {
    if (student.deposit <= 0) {
      alert("Deposit anak ini sudah habis!");
      return;
    }

    const newDeposit = student.deposit - 1;
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    try {
      const studentRef = doc(db, "deposits", student.id);
      await updateDoc(studentRef, {
        deposit: newDeposit,
        lastUpdated: today
      });

      setStudents(students.map(s => s.id === student.id ? { ...s, deposit: newDeposit, lastUpdated: today } : s));

      let formattedPhone = student.parentPhone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
      }

      const message = `Halo Kak/Bapak/Ibu Orang Tua dari *${student.childName}*,\n\nInformasi sesi belajar selesai pada hari ini (*${today}*).\n\n• Sisa Sesi/Deposit Terakhir: *${newDeposit} sesi*\n\nTerima kasih telah mempercayakan bimbingan kami! 🙏`;
      
      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');

    } catch (error) {
      console.error("Gagal memproses pemotongan:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data siswa ini?")) {
      await deleteDoc(doc(db, "deposits", id));
      fetchStudents();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard Manajemen Deposit</h1>
          <p className="text-slate-500 text-sm">Kelola sisa sesi dan kirim laporan WhatsApp otomatis sekali klik.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Tambah Data Siswa Baru</h2>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Nama Anak" 
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input 
              type="text" 
              placeholder="No. WA Orang Tua (cth: 08123...)" 
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input 
              type="number" 
              placeholder="Jumlah Deposit Awal (Sesi)" 
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button 
              type="submit" 
              className="md:col-span
