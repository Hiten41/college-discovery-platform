"use client";

import { useEffect, useState } from "react";

export default function SavedCollegesPage() {

  const [loading, setLoading] =
    useState(true);

  const [savedColleges, setSavedColleges] =
    useState<any[]>([]);

  useEffect(() => {

    const fetchSavedColleges =
      async () => {

        const user =
          JSON.parse(
            localStorage.getItem("user") ||
            "null"
          );

        if (!user) {

          window.location.href = "/login";
          return;

        }

        try {

          const res = await fetch(
            `/api/saved-colleges/${user.id}`
          );

          const data =
            await res.json();

          console.log(
            "SAVED DATA:",
            data
          );

          setSavedColleges(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);

        }

      };

    fetchSavedColleges();

  }, []);

  if (loading) {

    return (

      <div className="min-h-screen bg-black flex items-center justify-center text-white text-3xl font-bold">

        Loading Saved Colleges...

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-black mb-10">
        Saved Colleges
      </h1>

      {savedColleges.length === 0 ? (

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-3xl p-10 text-center">

          <h2 className="text-3xl font-black mb-4">
            No Saved Colleges
          </h2>

          <p className="text-gray-400">
            Save colleges from the homepage to see them here.
          </p>

        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {savedColleges.map((item) => (

            <div
              key={item.id}
              className="bg-[#181818] rounded-3xl overflow-hidden border border-[#2a2a2a]"
            >

              <img
                src={item.college.image}
                alt=""
                className="h-56 w-full object-cover"
              />

              <div className="p-6">

                <h2 className="text-2xl font-black mb-3">
                  {item.college.name}
                </h2>

                <p className="text-gray-400 mb-4">
                  {item.college.location}
                </p>

                <p className="text-green-400 font-bold">
                  {item.college.avgPackage}
                </p>

                <button
                  onClick={async () => {

                    await fetch(
                      `/api/saved-colleges/${item.id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    setSavedColleges(
                      savedColleges.filter(
                        (college) =>
                          college.id !== item.id
                      )
                    );

                  }}
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition"
                >
                  Remove
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}