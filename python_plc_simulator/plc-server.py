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