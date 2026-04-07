import { useState } from "react";
import axios from "axios";

export default function PublicAttendance() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    year: "",
    purpose: ""
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/attendance", form);

      alert("✅ Attendance Recorded!");

      setForm({
        name: "",
        email: "",
        phone: "",
        course: "",
        year: "",
        purpose: ""
      });

    } catch (err) {
      console.error(err);
      alert("❌ Error saving attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-center text-[#1B764C]">
          📚 Library Attendance
        </h2>

        {["name", "email", "phone", "course", "year", "purpose"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.toUpperCase()}
            value={(form as any)[field]}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1B764C] text-white py-2 rounded-lg hover:bg-[#016937]"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}