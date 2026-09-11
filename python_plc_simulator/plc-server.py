# plc_all_in_one.py
import subprocess
import time
import random
import atexit
import sys
from cpppo.server.enip.client import client
from cpppo.server.enip.parser import REAL, DINT

HOST = 'localhost'
PORT = 44818
# plc_simulator_dual.py
import subprocess
import threading
import time
import random
import atexit
import sys
from cpppo.server.enip.client import client
from cpppo.server.enip.parser import REAL, DINT

PORT = 44818
PLCS = {
    "PLC_001": "127.0.0.1",
    "PLC_002": "127.0.0.2",
}

# Normal operating parameters (mean, stddev) per metric
NORMAL_PARAMS = {
    "temp":    {"mean": 45.0, "stddev": 1.5},
    "rpm":     {"mean": 1500.0, "stddev": 20.0},
    "current": {"mean": 12.5, "stddev": 0.4},
}

# Fault-mode parameters — shifted mean + wider spread, simulating abnormal behavior
FAULT_PARAMS = {
    "temp":    {"mean": 78.0, "stddev": 6.0},
    "rpm":     {"mean": 1100.0, "stddev": 90.0},
    "current": {"mean": 18.0, "stddev": 2.5},
}

# Shared state: which PLCs are currently in "fault mode"
fault_state = {name: False for name in PLCS}
state_lock = threading.Lock()

server_procs = []

def start_servers():
    for name, ip in PLCS.items():
        cmd = [
            sys.executable, "-m", "cpppo.server.enip",
            "--address", f"{ip}:{PORT}",
            "Motor1_Temp=REAL[1]",
            "Motor1_RPM=REAL[1]",
            "Motor1_Current=REAL[1]",
            "Motor1_Status=DINT[1]",
        ]
        print(f"Starting simulator for {name} on {ip}:{PORT}")
        proc = subprocess.Popen(cmd)
        server_procs.append(proc)
        atexit.register(proc.terminate)
    time.sleep(2)  # give servers time to bind

def feed_loop(plc_name, ip):
    with client(host=ip, port=PORT) as conn:
        while True:
            with state_lock:
                faulted = fault_state[plc_name]

            params = FAULT_PARAMS if faulted else NORMAL_PARAMS

            temp = round(random.gauss(params["temp"]["mean"], params["temp"]["stddev"]), 2)
            rpm = round(random.gauss(params["rpm"]["mean"], params["rpm"]["stddev"]), 2)
            current = round(random.gauss(params["current"]["mean"], params["current"]["stddev"]), 2)
            status = 1 if faulted else 0

            for op in conn.write("Motor1_Temp", data=[temp], tag_type=REAL.tag_type):
                pass
            for op in conn.write("Motor1_RPM", data=[rpm], tag_type=REAL.tag_type):
                pass
            for op in conn.write("Motor1_Current", data=[current], tag_type=REAL.tag_type):
                pass
            for op in conn.write("Motor1_Status", data=[status], tag_type=DINT.tag_type):
                pass

            flag = " [FAULT MODE]" if faulted else ""
            print(f"[{plc_name}] temp={temp} rpm={rpm} current={current} status={status}{flag}")
            time.sleep(2)

def control_loop():
    print("\nControls:")
    print("  1  → toggle fault mode for PLC_001")
    print("  2  → toggle fault mode for PLC_002")
    print("  q  → quit\n")

    while True:
        cmd = input().strip().lower()
        if cmd == "1":
            with state_lock:
                fault_state["PLC_001"] = not fault_state["PLC_001"]
                print(f">>> PLC_001 fault mode: {fault_state['PLC_001']}")
        elif cmd == "2":
            with state_lock:
                fault_state["PLC_002"] = not fault_state["PLC_002"]
                print(f">>> PLC_002 fault mode: {fault_state['PLC_002']}")
        elif cmd == "q":
            print("Shutting down...")
            for proc in server_procs:
                proc.terminate()
            sys.exit(0)

if __name__ == "__main__":
    start_servers()

    threads = []
    for name, ip in PLCS.items():
        t = threading.Thread(target=feed_loop, args=(name, ip), daemon=True)
        t.start()
        threads.append(t)

    try:
        control_loop()
    except KeyboardInterrupt:
        print("\nStopping — shutting down server subprocesses...")
        for proc in server_procs:
            proc.terminate()
# --- 1. Start the cpppo EtherNet/IP server as a background subprocess ---
server_cmd = [
    sys.executable, "-m", "cpppo.server.enip",
    "--address", f"0.0.0.0:{PORT}",
    "Motor1_Temp=REAL[1]",
    "Motor1_RPM=REAL[1]",
    "Motor1_Current=REAL[1]",
    "Motor1_Status=DINT[1]",
]

print("Using interpreter:", sys.executable)
print("Starting cpppo EtherNet/IP server...")
server_proc = subprocess.Popen(server_cmd)

# Make sure the server process gets killed when this script exits
atexit.register(server_proc.terminate)

# Give the server a moment to actually bind the port before we start writing
time.sleep(2)

# --- 2. Feed fake motor data into it ---
def feed_loop():
    with client(host=HOST, port=PORT) as conn:
        while True:
            temp = round(40 + random.uniform(0, 20), 2)
            rpm = round(1400 + random.uniform(0, 200), 2)
            current = round(10 + random.uniform(0, 5), 2)
            fault = 1 if random.random() < 0.02 else 0

            for op in conn.write("Motor1_Temp", data=[temp], tag_type=REAL.tag_type):
                pass
            for op in conn.write("Motor1_RPM", data=[rpm], tag_type=REAL.tag_type):
                pass
            for op in conn.write("Motor1_Current", data=[current], tag_type=REAL.tag_type):
                pass
            for op in conn.write("Motor1_Status", data=[fault], tag_type=DINT.tag_type):
                pass

            print(f"Wrote: temp={temp} rpm={rpm} current={current} status={fault}")
            time.sleep(2)

if __name__ == "__main__":
    try:
        feed_loop()
    except KeyboardInterrupt:
        print("\nStopping — shutting down server subprocess...")
        server_proc.terminate()