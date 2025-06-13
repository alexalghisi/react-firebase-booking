import {useEffect, useState} from 'react';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
      async function load() {
          try {
              const res = await fetch('https://randomuser.me/api/');
              const json = await res.json();
              setData(json);
          } catch (error) {
              console.error(error);
          }
      }
      load();
  },[]);
    return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-3xl font-semibold">React Firebase Booking</h1>
        {!data && <p>Loading...</p>}

        {data && (
            <pre>{JSON.stringify(data,null,2)}</pre>
        )}



    </div>
  );
}
