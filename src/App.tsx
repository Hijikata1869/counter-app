import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";

const docRef = doc(db, "counter", "main");

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
    await updateDoc(docRef, { count: 0 });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-6">
        <h1 className="font-bold text-8xl text-gray-800">{count}</h1>
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
    </div>
  );
}

export default App;
