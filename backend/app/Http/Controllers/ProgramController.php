<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    /** Public: returns programs with generated year levels for the attendance form */
    public function index()
    {
        return response()->json(
            Program::orderBy('code')->get()->map(fn($p) => [
                'id'          => $p->id,
                'code'        => $p->code,
                'name'        => $p->name,
                'total_years' => $p->total_years,
                'year_levels' => $p->yearLevels(),
            ])
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:programs,code',
            'name'        => 'required|string|max:255',
            'total_years' => 'required|integer|min:1',
        ]);
        return response()->json(Program::create($validated), 201);
    }

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

    public function destroy(Program $program)
    {
        $program->delete();
        return response()->json(null, 204);
    }
}
