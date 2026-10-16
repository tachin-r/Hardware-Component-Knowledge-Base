// Hardware Component Knowledge Base Data
// Empirical findings, bench observations, and analog precision gotchas

const INITIAL_COMPONENTS = [
  {
    id: "ref5045",
    partNumber: "REF5045",
    manufacturer: "Texas Instruments",
    category: "Voltage Reference",
    package: "SOIC-8 / MSOP-8",
    rating: "4.5V / 3 ppm/°C Drift",
    image: "assets/ref5045.svg",
    tags: ["#LoopStability", "#CapacitorLeakage", "#HighZ", "#Vref", "#BreadboardTrap"],
    status: "Verified on Bench",
    severity: "Critical",
    summary: "Ultra-low noise, high-precision 4.5V voltage reference. Extremely sensitive to output capacitor ESR and Trim/NR pin leakage current.",
    projectRef: {
      name: "Pyranometer L1_Analog",
      url: "https://kicanvas.org/?github=https://github.com/tachin-r/Pyranometer_Over_engineering/tree/main/L1_Analog"
    },
    gotchas: [
      {
        title: "Trap 1: C10 (10µF Vout) Loop Instability",
        severity: "Danger",
        symptom: "Vref drops under ADC sampling load, or oscillates at high frequency (>100kHz). ADC 24-bit readings fluctuate wildly.",
        rootCause: "Internal output buffer requires minimum capacitance (1µF - 50µF) and ESR ≤ 1.5Ω for pole-zero loop stability compensation. Without it, the phase margin degrades to negative, leading to continuous oscillation or severe ringing on transient load.",
        fix: "Mandatory C10 (10µF) low-ESR ceramic (X7R) placed immediately adjacent to Pin 6 (Vout) and Pin 4 (GND). Never omit, even for quick breadboard testing."
      },
      {
        title: "Trap 2: C11 (1µF Trim/NR) High-Z Leakage Drift",
        severity: "Warning",
        symptom: "Vref output measures 4.3V - 4.45V instead of nominal 4.500V, or drifts significantly with ambient room temperature/humidity changes.",
        rootCause: "Pin 5 (Trim/NR) connects to an internal high-impedance resistor ladder (~100kΩ - 1MΩ). Any capacitor with non-zero leakage current (IR < 100MΩ, like cheap general-purpose MLCC or electrolytic) shunts current from this node. A mere 100nA leakage creates a 10mV - 100mV error! On breadboards, surface leakage between tie-points worsens this.",
        fix: "On Breadboard / Bench Prototype: LEAVE DNP (Do Not Populate) or use strictly high-grade C0G/film capacitor. If Vref shifts, remove C11 immediately."
      }
    ],
    prototypingAdvice: {
      breadboard: "DO NOT populate C11 (Trim/NR) on a breadboard. The tie-point leakage and dielectric absorption of cheap THT caps will corrupt your 4.5V reference. Keep C10 (10µF) connected with short, dedicated wires directly to the IC pins.",
      pcb: "Use high-grade 10µF X7R 16V SMD (0805 or 1206) for C10. For C11, use C0G/NPO dielectric or high-insulation-resistance X7R (>100MΩ) with guarding against moisture/flux residue."
    },
    pinout: [
      { pin: "1, 8", name: "TEMP", role: "Temperature Sensor Output (approx 2.1mV/°C)" },
      { pin: "2", name: "VIN", role: "Power Supply Input (+5.2V to +18V)" },
      { pin: "3", name: "TEMP", role: "Temperature Output" },
      { pin: "4", name: "GND", role: "Ground reference connection" },
      { pin: "5", name: "TRIM/NR", role: "Noise Reduction / Output Voltage Trim (High-Z!)" },
      { pin: "6", name: "VOUT", role: "+4.500V Precision Reference Output" },
      { pin: "7", name: "NC", role: "No Connection" }
    ]
  },
  {
    id: "ads1220",
    partNumber: "ADS1220",
    manufacturer: "Texas Instruments",
    category: "ADC",
    package: "TSSOP-16 / VQFN-16",
    rating: "24-bit / 2 kSPS / Low Power",
    image: "assets/ads1220.svg",
    tags: ["#DifferentialPair", "#MUXOffset", "#GroundBounce", "#CMRR", "#AnalogFrontEnd"],
    status: "Verified on Bench",
    severity: "High",
    summary: "24-bit delta-sigma ADC with programmable gain amplifier (PGA). Single-ended measurement introduces heavy ground offset; differential grouping cancels common-mode errors.",
    projectRef: {
      name: "Pyranometer L1_Analog",
      url: "https://kicanvas.org/?github=https://github.com/tachin-r/Pyranometer_Over_engineering/tree/main/L1_Analog"
    },
    gotchas: [
      {
        title: "Trap 1: Single-Ended Measurement Ground & MUX Offset Accumulation",
        severity: "Warning",
        symptom: "Zero-input readings have a static offset of tens to hundreds of LSBs that drift with temperature, requiring complicated firmware offset calibration routines.",
        rootCause: "Measuring single-ended against AVSS couples digital return currents, wire resistance, and MUX channel asymmetry directly into the measurement. The internal PGA input stage is fundamentally differential.",
        fix: "Group paired inputs symmetrically on Bank 1 (e.g., AIN0 for Vop, AIN1 for Vbias). Differential sensing (AIN0 - AIN1) rejects ground bounce and common-mode TIA bias drift completely (>100 dB CMRR)."
      },
      {
        title: "Trap 2: Internal MUX Channel Swapping",
        severity: "Info",
        symptom: "Offset shifts when switching between arbitrary channels (e.g., AIN0 vs AIN2).",
        rootCause: "The multiplexer internal resistance and sampling charge injection are closely matched only between designated complementary pairs (AIN0/AIN1 and AIN2/AIN3).",
        fix: "Keep high-priority analog sensor pairs strictly on AIN0/AIN1. Dedicate AIN2/AIN3 to auxiliary slow channels like NTC / temperature sensing."
      }
    ],
    prototypingAdvice: {
      breadboard: "Always use twisted pairs or tightly adjacent breadboard rows for AIN0 and AIN1. Place 47Ω damping resistors close to SPI digital pins (SCLK, DIN, DOUT) to prevent digital clock edges from coupling into the analog input pins.",
      pcb: "Route AIN0 and AIN1 as a symmetrical differential pair over an uninterrupted analog ground plane. Isolate digital SPI traces with ground copper pours."
    },
    pinout: [
      { pin: "1", name: "SCLK", role: "Serial SPI Clock Input" },
      { pin: "2", name: "CS", role: "Chip Select (Active Low)" },
      { pin: "6", name: "AIN3/REFN1", role: "Analog Input 3 or Negative Reference 1" },
      { pin: "7", name: "AIN2", role: "Analog Input 2 (NTC Ambient Temp)" },
      { pin: "8", name: "REFN0", role: "Negative Reference 0 (Connect to Analog GND)" },
      { pin: "9", name: "REFP0", role: "Positive Reference 0 (Connect to +4.5Vref)" },
      { pin: "10", name: "AIN1", role: "Analog Input 1 (Vbias TIA reference)" },
      { pin: "11", name: "AIN0/REFP1", role: "Analog Input 0 (Vop TIA output)" },
      { pin: "12", name: "AVDD", role: "Analog Power (+5.2VLDD)" },
      { pin: "13", name: "DVDD", role: "Digital Core Power (+3.3VLDD)" },
      { pin: "14", name: "DRDY", role: "Data Ready Output" },
      { pin: "15", name: "DOUT/DRDY", role: "Serial Data Output" },
      { pin: "16", name: "DIN", role: "Serial Data Input" }
    ]
  },
  {
    id: "opa380",
    partNumber: "OPA380",
    manufacturer: "Texas Instruments",
    category: "Op-Amp / TIA",
    package: "SOIC-8 / MSOP-8",
    rating: "90 MHz GBW / Precision Transimpedance",
    image: "assets/opa380.svg",
    tags: ["#Transimpedance", "#Photodiode", "#Stability", "#CfCapacitor", "#LowNoise"],
    status: "Verified in Design",
    severity: "High",
    summary: "Specialized high-speed, precision transimpedance amplifier designed specifically for photodiode current-to-voltage conversion with sub-picoamp input bias current.",
    projectRef: {
      name: "Pyranometer L1_Analog",
      url: "https://kicanvas.org/?github=https://github.com/tachin-r/Pyranometer_Over_engineering/tree/main/L1_Analog"
    },
    gotchas: [
      {
        title: "Trap 1: Photodiode Junction Capacitance Induced Peaking & Oscillation",
        severity: "Danger",
        symptom: "Output rings violently on step light changes or oscillates continuously at several megahertz, giving erratic high ADC values.",
        rootCause: "The photodiode junction capacitance (Cj) plus input capacitance (Cin) forms a zero in the feedback loop: fz = 1 / (2π * Rf * (Cj + Cin)). Without feedback capacitance Cf, phase margin drops to near zero.",
        fix: "Select feedback capacitor Cf = sqrt((Cj + Cin) / (2π * Rf * GBW)) to achieve Butterworth flat response (45° - 65° phase margin). For BPX 61 (Cj ~72pF at 0V), tune Cf accurately."
      },
      {
        title: "Trap 2: PCB Surface Leakage Exceeding Photodiode Signal",
        severity: "Warning",
        symptom: "In dark conditions, output voltage does not reach expected zero/bias floor; drifts with room humidity.",
        rootCause: "Photodiode current is in the nanoamp to microamp range. PCB solder flux residue and surface humidity conduct leakage currents across IC pins.",
        fix: "Surround inverting pin (Pin 2) and photodiode anode trace with a complete Guard Ring driven at the same potential as non-inverting pin (Pin 3)."
      }
    ],
    prototypingAdvice: {
      breadboard: "Breadboard socket capacitance (~2pF to 5pF between rows) and parasitic leakage will limit bandwidth and cause offset. Keep Rf and Cf leads as microscopic as possible, directly soldered over the IC pins if feasible.",
      pcb: "Remove solder mask and copper planes beneath the inverting pin summing junction to minimize parasitic capacitance. Always implement guarded routing."
    },
    pinout: [
      { pin: "1", name: "NC", role: "No Connection" },
      { pin: "2", name: "-IN", role: "Inverting Input (Photodiode Summing Junction - Sensitive!)" },
      { pin: "3", name: "+IN", role: "Non-inverting Input (Connected to Vbias reference)" },
      { pin: "4", name: "V-", role: "Negative Supply / GND" },
      { pin: "5", name: "NC", role: "No Connection" },
      { pin: "6", name: "OUT", role: "Transimpedance Voltage Output (Vop)" },
      { pin: "7", name: "V+", role: "Positive Power Supply (+5.2V)" },
      { pin: "8", name: "NC", role: "No Connection" }
    ]
  },
  {
    id: "lm2596-hw411",
    partNumber: "LM2596 (HW-411)",
    manufacturer: "Generic / Ti Design Clones",
    category: "Power Supply",
    package: "Module / TO-263",
    rating: "3A Step-Down / 150 kHz (Original)",
    image: "assets/lm2596.svg",
    tags: ["#SwitchingNoise", "#BuckConverter", "#GroundLoop", "#FakeIC", "#EMI"],
    status: "Bench Tested",
    severity: "Critical",
    summary: "Common buck regulator module widely used in lab prototyping. Infamous for high-frequency switching spikes and counterfeit 50kHz ICs that inject noise into analog front-ends.",
    projectRef: {
      name: "Pyranometer reverse_component",
      url: "https://kicanvas.org/?github=https://github.com/tachin-r/Pyranometer_Over_engineering/tree/main/reverse_component/LM2596_HW411"
    },
    gotchas: [
      {
        title: "Trap 1: 30MHz - 100MHz Diode Reverse-Recovery Spikes",
        severity: "Danger",
        symptom: "Broadband fuzz and sharp spikes visible on op-amp outputs and ADC readings, even with large electrolytic filtering capacitors.",
        rootCause: "Hard switching of the freewheeling diode (SS34/1N5822) creates high-di/dt current loops. Electrolytic output caps have high ESL and cannot bypass these 20ns-wide spikes.",
        fix: "Never feed LM2596 raw output directly to sensitive analog rails. Cascade with an LC Pi-filter (Ferrite bead + 10µF Ceramic) followed by an Ultra-Low-Noise LDO (e.g. TPS7A or LP5907)."
      },
      {
        title: "Trap 2: Counterfeit 50kHz Oscillator Clones",
        severity: "Warning",
        symptom: "Module gets scorching hot at modest loads (<1A), output ripple is 200mV+ instead of 30mV.",
        rootCause: "Cheap commercial modules often carry clone ICs running at 50kHz (LM2576 die re-labeled as LM2596). The on-board 33µH - 47µH inductor is undersized for 50kHz and enters deep magnetic saturation.",
        fix: "Verify switching frequency on oscilloscope (150kHz vs 52kHz). For precision instrumentation, replace with verified Texas Instruments or Monolithic Power parts on dedicated PCB."
      }
    ],
    prototypingAdvice: {
      breadboard: "Keep the module physically separated from breadboard analog sensor wires by at least 15cm. Use star grounding at the power entry point to prevent switching ground return currents from modulating the sensor ground.",
      pcb: "Keep SW node copper area tight to minimize E-field EMI radiation. Solid ground plane underneath."
    },
    pinout: [
      { pin: "1", name: "IN+", role: "Unregulated DC Input Voltage (+7V to +35V)" },
      { pin: "2", name: "IN-", role: "Input Ground Return" },
      { pin: "3", name: "OUT+", role: "Regulated Step-down Output Voltage" },
      { pin: "4", name: "OUT-", role: "Output Ground Return (Do not isolate from IN-)" }
    ]
  },
  {
    id: "bpx61",
    partNumber: "BPX 61",
    manufacturer: "Osram / ams OSRAM",
    category: "Sensors",
    package: "TO-39 Hermetic Metal Can",
    rating: "400 - 1100 nm / 7.02 mm² Active Area",
    image: "assets/bpx61.svg",
    tags: ["#Photodiode", "#SolarIrradiance", "#DarkCurrent", "#Pyranometer", "#Sensor"],
    status: "Verified in Design",
    severity: "Info",
    summary: "Large active area (7.02 mm²) silicon planar photodiode in a hermetically sealed TO-39 package with flat glass window. Ideal for precision solar pyranometers.",
    projectRef: {
      name: "Pyranometer L1_Analog",
      url: "https://kicanvas.org/?github=https://github.com/tachin-r/Pyranometer_Over_engineering/tree/main/L1_Analog"
    },
    gotchas: [
      {
        title: "Trap 1: Dark Current Temperature Dependence",
        severity: "Warning",
        symptom: "Zero-sunlight baseline voltage rises noticeably as the sensor body warms up under ambient sunlight.",
        rootCause: "Silicon photodiode dark current roughly doubles every 8°C - 10°C increase in junction temperature.",
        fix: "Operate in Photovoltaic mode (0V reverse bias) where dark current is virtually zero (sub-picoamp). Use integrated NTC sensor on L1 to mathematically compensate residual temperature coefficient of sensitivity (typically +0.15%/°C)."
      }
    ],
    prototypingAdvice: {
      breadboard: "Shield the glass window from fluorescent room lights during bench testing, as 100Hz/120Hz ballast flicker will swamp small DC irradiance signals.",
      pcb: "Solder the TO-39 case pin to analog ground to create a 360-degree Faraday shield against stray RF interference."
    },
    pinout: [
      { pin: "1", name: "Anode", role: "Photodiode Anode (Connects to TIA summing junction)" },
      { pin: "2", name: "Cathode", role: "Photodiode Cathode (Connects to Vbias or GND)" },
      { pin: "Case", name: "Case", role: "Metal Can Shield (Connect to clean Analog GND)" }
    ]
  }
];
