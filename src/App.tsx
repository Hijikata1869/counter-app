import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";

const docRef = doc(db, "counter", "main");

const formatDate = (date: Date) =>
  `${date.getFullYear()} - ${date.getMonth() + 1} - ${date.getDate()}`;

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [today, setToday] = useState(() => formatDate(new Date()));
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setToday(formatDate(new Date())), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (running) {
      startTimeRef.current = performance.now() - elapsed;
      const tick = () => {
        setElapsed(performance.now() - startTimeRef.current!);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  const toggle = () => setRunning((r) => !r);

  const reset = () => {
    if (running || elapsed === 0) return;
    setElapsed(0);
  };

  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-2xl shadow-md p-10 w-96 flex flex-col items-center gap-6">
      <h2 className="text-lg font-semibold text-gray-400 tracking-widest uppercase">Stopwatch</h2>
      <p className="text-2xl font-bold text-gray-800 tracking-widest tabular-nums">{today}</p>
      <p className="font-bold text-8xl text-gray-800 tabular-nums">{display}</p>
      <div className="w-full flex items-center justify-center gap-6">
        {!running && (
          <button
            onClick={reset}
            disabled={elapsed === 0}
            className="text-2xl w-16 h-16 rounded-full cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ⟳
          </button>
        )}
        <button
          onClick={toggle}
          className={`text-2xl w-16 h-16 rounded-full cursor-pointer ${
            running
              ? "bg-red-100 hover:bg-red-200 text-red-500"
              : "bg-green-100 hover:bg-green-200 text-green-600"
          }`}
        >
          {running ? "⏸" : "▶"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setCount(snapshot.data().count);
      } else {
        setDoc(docRef, { count: 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  const increment = async () => {
    await updateDoc(docRef, { count: count + 1 });
  };

  const decrement = async () => {
    if (count <= 0) return;
    await updateDoc(docRef, { count: count - 1 });
  };

  const reset = async () => {
    if (count !== 0 && !window.confirm("リセットしますか？")) return;
    await updateDoc(docRef, { count: 0 });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="bg-white rounded-2xl shadow-md p-10 w-96 flex flex-col items-center gap-6">
          <h2 className="text-lg font-semibold text-gray-400 tracking-widest uppercase">Counter</h2>
          <p className="font-bold text-8xl text-gray-800">{count}</p>
          <div className="flex gap-10">
            <button
              onClick={increment}
              className="text-2xl bg-gray-200 hover:bg-gray-300 w-16 h-16 rounded-full cursor-pointer"
            >
              ＋
            </button>
            <button
              onClick={decrement}
              className="text-2xl bg-gray-200 hover:bg-gray-300 w-16 h-16 rounded-full cursor-pointer"
            >
              －
            </button>
          </div>
          <button
            onClick={reset}
            className="mt-10 text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            リセット
          </button>
        </div>
        <Stopwatch />
      </div>
    </div>
  );
}

export default App;
