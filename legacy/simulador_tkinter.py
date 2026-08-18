import tkinter as tk
from tkinter import ttk
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import cmath

def polar_to_rect(mag, ang_deg):
    ang_rad = np.radians(ang_deg)
    return cmath.rect(mag, ang_rad)

def calculate_components(*args):
    try:
        # Leer entradas
        va_mag = float(va_mag_var.get())
        va_ang = float(va_ang_var.get())
        vb_mag = float(vb_mag_var.get())
        vb_ang = float(vb_ang_var.get())
        vc_mag = float(vc_mag_var.get())
        vc_ang = float(vc_ang_var.get())

        # Fasores originales (estacionarios t=0)
        Va_base = polar_to_rect(va_mag, va_ang)
        Vb_base = polar_to_rect(vb_mag, vb_ang)
        Vc_base = polar_to_rect(vc_mag, vc_ang)

        # Operador a
        a = cmath.rect(1, np.radians(120))
        a2 = cmath.rect(1, np.radians(240))

        # Cálculo de componentes simétricas (referencia Fase A)
        Va0_base = (Va_base + Vb_base + Vc_base) / 3.0
        Va1_base = (Va_base + a * Vb_base + a2 * Vc_base) / 3.0
        Va2_base = (Va_base + a2 * Vb_base + a * Vc_base) / 3.0

        # Componentes para Fases B y C
        Vb1_base, Vc1_base = a2 * Va1_base, a * Va1_base
        Vb2_base, Vc2_base = a * Va2_base, a2 * Va2_base
        Vb0_base, Vc0_base = Va0_base, Va0_base

        # Actualizar valores numéricos en pantalla (siempre en t=0)
        res_1_var.set(f"V1 = {abs(Va1_base):.2f} ∠ {np.degrees(cmath.phase(Va1_base)):.2f}°")
        res_2_var.set(f"V2 = {abs(Va2_base):.2f} ∠ {np.degrees(cmath.phase(Va2_base)):.2f}°")
        res_0_var.set(f"V0 = {abs(Va0_base):.2f} ∠ {np.degrees(cmath.phase(Va0_base)):.2f}°")

        # Aplicar rotación para la animación
        rot = cmath.rect(1, np.radians(angle_deg))
        
        Va, Vb, Vc = Va_base * rot, Vb_base * rot, Vc_base * rot
        Va0, Vb0, Vc0 = Va0_base * rot, Vb0_base * rot, Vc0_base * rot
        Va1, Vb1, Vc1 = Va1_base * rot, Vb1_base * rot, Vc1_base * rot
        Va2, Vb2, Vc2 = Va2_base * rot, Vb2_base * rot, Vc2_base * rot

        # Actualizar gráficos
        update_plot(Va, Vb, Vc, Va1, Vb1, Vc1, Va2, Vb2, Vc2, Va0, Vb0, Vc0)

    except ValueError:
        pass

def update_plot(Va, Vb, Vc, Va1, Vb1, Vc1, Va2, Vb2, Vc2, Va0, Vb0, Vc0):
    for ax in (ax1, ax2, ax3, ax4, ax5):
        ax.clear()
        ax.axhline(0, color='gray', linestyle='--', linewidth=0.5)
        ax.axvline(0, color='gray', linestyle='--', linewidth=0.5)
    
    def plot_phasors(ax, v_a, v_b, v_c, title, is_zero=False):
        max_val = max(abs(Va), abs(Vb), abs(Vc))
        offset = max_val * 0.05 if is_zero else 0
        
        orig_a = [0], [0]
        orig_b = [0], [offset]
        orig_c = [0], [-offset]
        
        ax.quiver(*orig_a, v_a.real, v_a.imag, color='red', angles='xy', scale_units='xy', scale=1, width=0.012)
        ax.quiver(*orig_b, v_b.real, v_b.imag, color='blue', angles='xy', scale_units='xy', scale=1, width=0.012)
        ax.quiver(*orig_c, v_c.real, v_c.imag, color='green', angles='xy', scale_units='xy', scale=1, width=0.012)
        
        lim = max_val * 1.3 if max_val > 0 else 1
        ax.set_xlim(-lim, lim)
        ax.set_ylim(-lim, lim)
        ax.set_title(title, fontsize=10, fontweight='bold')
        ax.grid(True, linestyle=':', alpha=0.6)
        ax.set_aspect('equal')

    # Gráficos estándar
    plot_phasors(ax1, Va, Vb, Vc, "Sistema Original")
    plot_phasors(ax2, Va1, Vb1, Vc1, "Secuencia Positiva")
    plot_phasors(ax3, Va2, Vb2, Vc2, "Secuencia Negativa")
    plot_phasors(ax4, Va0, Vb0, Vc0, "Secuencia Cero", is_zero=True)
    
    # Gráfico 5: Reconstrucción (Suma de fasores)
    max_val = max(abs(Va), abs(Vb), abs(Vc))
    lim = max_val * 1.3 if max_val > 0 else 1
    ax5.set_xlim(-lim, lim)
    ax5.set_ylim(-lim, lim)
    ax5.set_title("Reconstrucción: Suma de Componentes (V0 + V1 + V2 = V)", fontsize=11, fontweight='bold')
    ax5.grid(True, linestyle=':', alpha=0.6)
    ax5.set_aspect('equal')

    def draw_addition(v0, v1, v2, v_total, color, label):
        pts = [0j, v0, v0+v1, v0+v1+v2]
        xs = [p.real for p in pts]
        ys = [p.imag for p in pts]
        
        # Dibujar líneas uniendo los componentes (polígono)
        ax5.plot(xs, ys, color=color, linestyle='-', linewidth=2.5, marker='o', markersize=4, alpha=0.5)
        
        # Dibujar la flecha del vector original resultante
        ax5.quiver(0, 0, v_total.real, v_total.imag, color=color, angles='xy', scale_units='xy', scale=1, width=0.012, label=label)

    # Dibujar la suma para las 3 fases
    draw_addition(Va0, Va1, Va2, Va, 'red', 'Fase A')
    draw_addition(Vb0, Vb1, Vb2, Vb, 'blue', 'Fase B')
    draw_addition(Vc0, Vc1, Vc2, Vc, 'green', 'Fase C')
    
    ax5.legend(loc='upper right', fontsize='small')

    fig.tight_layout(pad=1.5)
    canvas.draw_idle()

# Animación
is_animating = False
angle_deg = 0

def toggle_animation():
    global is_animating
    is_animating = not is_animating
    if is_animating:
        btn_anim.config(text="⏸ Pausar Animación")
        animate()
    else:
        btn_anim.config(text="▶ Animar Rotación")

def animate():
    global angle_deg
    if is_animating:
        angle_deg = (angle_deg + 2.5) % 360  # Velocidad de rotación
        calculate_components()
        root.after(30, animate) # 30ms = ~33 fps

# --- Configuración de Interfaz Gráfica (Tkinter) ---
root = tk.Tk()
root.title("Simulador de Componentes Simétricas Animado")
root.geometry("1100x700")

# Panel Izquierdo (Controles)
frame_left = ttk.Frame(root)
frame_left.pack(side=tk.LEFT, fill=tk.Y, padx=15, pady=15)

frame_inputs = ttk.LabelFrame(frame_left, text="Fasores Originales (Magnitud, Ángulo °)")
frame_inputs.pack(fill=tk.X, pady=10)

va_mag_var = tk.StringVar(value="1.0")
va_ang_var = tk.StringVar(value="0")
vb_mag_var = tk.StringVar(value="1.0")
vb_ang_var = tk.StringVar(value="-120")
vc_mag_var = tk.StringVar(value="1.0")
vc_ang_var = tk.StringVar(value="120")

# Actualizar estáticamente si no está animando
def on_input_change(*args):
    if not is_animating:
        calculate_components()

for var in (va_mag_var, va_ang_var, vb_mag_var, vb_ang_var, vc_mag_var, vc_ang_var):
    var.trace_add('write', on_input_change)

ttk.Label(frame_inputs, text="Fase A:", foreground="red").grid(row=0, column=0, padx=2, pady=5, sticky='e')
ttk.Entry(frame_inputs, textvariable=va_mag_var, width=6).grid(row=0, column=1)
ttk.Label(frame_inputs, text="∠").grid(row=0, column=2)
ttk.Entry(frame_inputs, textvariable=va_ang_var, width=6).grid(row=0, column=3)
ttk.Label(frame_inputs, text="°").grid(row=0, column=4, sticky='w')

ttk.Label(frame_inputs, text="Fase B:", foreground="blue").grid(row=1, column=0, padx=2, pady=5, sticky='e')
ttk.Entry(frame_inputs, textvariable=vb_mag_var, width=6).grid(row=1, column=1)
ttk.Label(frame_inputs, text="∠").grid(row=1, column=2)
ttk.Entry(frame_inputs, textvariable=vb_ang_var, width=6).grid(row=1, column=3)
ttk.Label(frame_inputs, text="°").grid(row=1, column=4, sticky='w')

ttk.Label(frame_inputs, text="Fase C:", foreground="green").grid(row=2, column=0, padx=2, pady=5, sticky='e')
ttk.Entry(frame_inputs, textvariable=vc_mag_var, width=6).grid(row=2, column=1)
ttk.Label(frame_inputs, text="∠").grid(row=2, column=2)
ttk.Entry(frame_inputs, textvariable=vc_ang_var, width=6).grid(row=2, column=3)
ttk.Label(frame_inputs, text="°").grid(row=2, column=4, sticky='w')

# Controles de Animación
frame_anim = ttk.LabelFrame(frame_left, text="Animación Temporal")
frame_anim.pack(fill=tk.X, pady=10)

btn_anim = tk.Button(frame_anim, text="▶ Animar Rotación", command=toggle_animation, bg="#4CAF50", fg="white", font=("Arial", 10, "bold"))
btn_anim.pack(fill=tk.X, padx=10, pady=10)

def reset_angle():
    global angle_deg
    angle_deg = 0
    if not is_animating:
        calculate_components()

tk.Button(frame_anim, text="↺ Reiniciar Ángulo", command=reset_angle).pack(fill=tk.X, padx=10, pady=(0, 10))


frame_results = ttk.LabelFrame(frame_left, text="Componentes Simétricas (Fase A)")
frame_results.pack(fill=tk.X, pady=10)

res_1_var = tk.StringVar()
res_2_var = tk.StringVar()
res_0_var = tk.StringVar()

ttk.Label(frame_results, textvariable=res_1_var, foreground="#333", font=("Consolas", 10)).pack(anchor="w", padx=10, pady=2)
ttk.Label(frame_results, textvariable=res_2_var, foreground="#333", font=("Consolas", 10)).pack(anchor="w", padx=10, pady=2)
ttk.Label(frame_results, textvariable=res_0_var, foreground="#333", font=("Consolas", 10)).pack(anchor="w", padx=10, pady=2)

def load_example(type):
    if type == "balanced":
        va_mag_var.set("1.0"), va_ang_var.set("0")
        vb_mag_var.set("1.0"), vb_ang_var.set("-120")
        vc_mag_var.set("1.0"), vc_ang_var.set("120")
    elif type == "phase_drop":
        va_mag_var.set("1.0"), va_ang_var.set("0")
        vb_mag_var.set("0.2"), vb_ang_var.set("-120")
        vc_mag_var.set("1.0"), vc_ang_var.set("120")
    elif type == "single_phase":
        va_mag_var.set("1.0"), va_ang_var.set("0")
        vb_mag_var.set("0.0"), vb_ang_var.set("0")
        vc_mag_var.set("0.0"), vc_ang_var.set("0")

frame_examples = ttk.LabelFrame(frame_left, text="Ejemplos Rápidos")
frame_examples.pack(fill=tk.X, pady=10)

ttk.Button(frame_examples, text="Sistema Balanceado", command=lambda: load_example("balanced")).pack(fill=tk.X, padx=5, pady=2)
ttk.Button(frame_examples, text="Falla Fase B (Baja Mag)", command=lambda: load_example("phase_drop")).pack(fill=tk.X, padx=5, pady=2)
ttk.Button(frame_examples, text="Inyección Monofásica", command=lambda: load_example("single_phase")).pack(fill=tk.X, padx=5, pady=2)


# --- Gráficos Matplotlib ---
frame_right = ttk.Frame(root)
frame_right.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

# Grid layout: 2 filas x 3 columnas
fig = plt.figure(figsize=(10, 6))
fig.patch.set_facecolor('#f0f0f0')

gs = fig.add_gridspec(2, 3)
ax1 = fig.add_subplot(gs[0, 0]) # Original
ax2 = fig.add_subplot(gs[0, 1]) # Positiva
ax3 = fig.add_subplot(gs[0, 2]) # Negativa
ax4 = fig.add_subplot(gs[1, 0]) # Cero
ax5 = fig.add_subplot(gs[1, 1:]) # Reconstrucción (ocupa 2 columnas)

canvas = FigureCanvasTkAgg(fig, master=frame_right)
canvas_widget = canvas.get_tk_widget()
canvas_widget.pack(fill=tk.BOTH, expand=True)

# Dibujo inicial
calculate_components()

root.mainloop()
