from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import cmath

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    va_mag: float
    va_ang: float
    vb_mag: float
    vb_ang: float
    vc_mag: float
    vc_ang: float

def polar_to_rect(mag, ang_deg):
    return cmath.rect(mag, np.radians(ang_deg))

def rect_to_json(c):
    return {
        "real": c.real,
        "imag": c.imag,
        "mag": abs(c),
        "ang": np.degrees(cmath.phase(c))
    }

@app.post("/api/calculate")
def calculate(data: InputData):
    Va = polar_to_rect(data.va_mag, data.va_ang)
    Vb = polar_to_rect(data.vb_mag, data.vb_ang)
    Vc = polar_to_rect(data.vc_mag, data.vc_ang)

    a = cmath.rect(1, np.radians(120))
    a2 = cmath.rect(1, np.radians(240))

    Va0 = (Va + Vb + Vc) / 3.0
    Va1 = (Va + a * Vb + a2 * Vc) / 3.0
    Va2 = (Va + a2 * Vb + a * Vc) / 3.0

    Vb1, Vc1 = a2 * Va1, a * Va1
    Vb2, Vc2 = a * Va2, a2 * Va2
    Vb0, Vc0 = Va0, Va0

    return {
        "Va": rect_to_json(Va), "Vb": rect_to_json(Vb), "Vc": rect_to_json(Vc),
        "Va0": rect_to_json(Va0), "Vb0": rect_to_json(Vb0), "Vc0": rect_to_json(Vc0),
        "Va1": rect_to_json(Va1), "Vb1": rect_to_json(Vb1), "Vc1": rect_to_json(Vc1),
        "Va2": rect_to_json(Va2), "Vb2": rect_to_json(Vb2), "Vc2": rect_to_json(Vc2),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
