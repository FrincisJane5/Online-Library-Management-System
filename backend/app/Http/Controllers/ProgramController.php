<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

/**
 * ProgramController — CRUD for academic programs (courses).
 * The index route is public (used by the attendance form dropdown).
 * Store, update, and destroy are admin-only.
 */
class ProgramController extends Controller
{
    /**
     * GET /api/programs
     * Returns all programs with generated year level labels.
     * Used by the attendance form and borrow form course dropdowns.
     */
    public function index()
    {
        return response()->json(
            Program::orderBy('code')->get()->map(fn($p) => [
                'id'          => $p->id,
                'code'        => $p->code,
                'name'        => $p->name,
                'total_years' => $p->total_years,
                'year_levels' => $p->yearLevels(), // e.g. ["1st Year", "2nd Year", ...]
            ])
        );
    }

    /** POST /api/programs — creates a new program */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:programs,code',
            'name'        => 'required|string|max:255',
            'total_years' => 'required|integer|min:1',
        ]);
        return response()->json(Program::create($validated), 201);
    }

    /** PUT /api/programs/{program} — updates an existing program */
    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:programs,code,' . $program->id,
            'name'        => 'required|string|max:255',
            'total_years' => 'required|integer|min:1',
        ]);
        $program->update($validated);
        return response()->json($program->fresh());
    }

    /** DELETE /api/programs/{program} — deletes a program */
    public function destroy(Program $program)
    {
        $program->delete();
        return response()->json(null, 204);
    }
}
