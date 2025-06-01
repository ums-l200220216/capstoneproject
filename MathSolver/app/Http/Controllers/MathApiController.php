<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MathApiController extends Controller
{
    public function solveImage(Request $request)
    {
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'No image uploaded'], 400);
        }

        $image = $request->file('image');
        $imagePath = $image->store('public/uploads');

        $imageFullPath = storage_path('app/' . $imagePath);

        $scriptPath = base_path('python/ocr_solver.py');

        $output = shell_exec("python3 " . escapeshellarg($scriptPath) . ' ' . escapeshellarg($imageFullPath));

        return response()->json(['result' => json_decode($output, true)]);
    }

}
