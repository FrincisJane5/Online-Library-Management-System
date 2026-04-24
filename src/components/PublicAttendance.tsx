import { useState } from "react";
import axios from "axios";

export default function PublicAttendance() {
  const [form, setForm] = useState({
    id_number: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    year: "",
    purpose: ""
  });

  const [loading, setLoading] = useState(false);
  const courses = ["BSIT", "BSBA", "BSED", "BSCRIM"];
  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/attendance", form);

      alert("✅ Attendance Recorded!");

      setForm({
        id_number: "",
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

        <input
          type="text"
          placeholder="ID Number"
          value={form.id_number}
          onChange={(e) => setForm({ ...form, id_number: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
        />
        <input
          type="text"
          placeholder="Student Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
        />
        <select
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
        >
          <option value="">Select Course</option>
          {courses.map((course) => <option key={course} value={course}>{course}</option>)}
        </select>
        <select
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
        >
          <option value="">Select Year Level</option>
          {yearLevels.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        <input
          type="text"
          placeholder="Purpose"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
        />

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