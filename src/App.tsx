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
    await updateDoc(docRef, { count: count - 1 });
  };

  const reset = async () => {
    await updateDoc(docRef, { count: 0 });
  };

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={increment}>＋</button>
      <button onClick={decrement}>－</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}

export default App;
