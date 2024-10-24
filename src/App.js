import "./App.css";
import React, { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    jobName: "",
    partition: "",
    cpuPerTask: "",
    memPerCPU: "",
    mailUser: "",
    mailType: [],
    jobTimeLimitHours: "",
    jobTimeLimitMinutes: "",
  });

  const handle_change = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMailTypeChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      mailType: prevState.mailType.includes(value)
        ? prevState.mailType.filter((type) => type !== value)
        : [...prevState.mailType, value],
    }));
  };

  const generateScriptContent = () => {
    const timeLimit = `${formData.jobTimeLimitHours.padStart(
      2,
      "0"
    )}:${formData.jobTimeLimitMinutes.padStart(2, "0")}:00`;

    return `#!/bin/bash
#SBATCH --job-name=${formData.jobName}
#SBATCH --partition=${formData.partition}
#SBATCH --cpus-per-task=${formData.cpuPerTask}
#SBATCH --mem-per-cpu=${formData.memPerCPU}G
#SBATCH --mail-user=${formData.mailUser}
${formData.mailType.map((type) => `#SBATCH --mail-type=${type}`).join("\n")}
#SBATCH --time=${timeLimit}

_term() {
    kill -s SIGTERM $pid
    wait $pid
}
trap _term SIGTERM

export NXF_APPTAINER_CACHEDIR=/mnt/workdir/singularity/
export NXF_ENABLE_VIRTUAL_THREADS=false

PROJECT=${formData.jobName}
RUNDIR=$PWD

mkdir -p \${PROJECT}
cd \${PROJECT}


#command run here

cd ..

wait $pid
exit 0
`;
  };

  const downloadScript = () => {
    const element = document.createElement("a");
    const file = new Blob([generateScriptContent()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.jobName || "slurm-job"}.sh`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="content">
        <div className="content_left">
          <div className="cover_left">
            <h2>Parameters</h2>
            <div className="partition">
              <p>Job name: </p>
              <input
                type="text"
                name="jobName"
                value={formData.jobName}
                onChange={handle_change}
                placeholder="Enter job name"
              />
            </div>
            <div className="partition">
              <p>Partition: </p>
              <label>
                <input
                  type="radio"
                  value="prod"
                  name="partition"
                  checked={formData.partition === "prod"}
                  onChange={handle_change}
                />
                prod
              </label>
              <label>
                <input
                  type="radio"
                  value="dev"
                  name="partition"
                  checked={formData.partition === "dev"}
                  onChange={handle_change}
                />
                devel
              </label>
            </div>

            <div className="partition">
              <p>CPU per task: </p>
              <input
                type="number"
                name="cpuPerTask"
                value={formData.cpuPerTask}
                onChange={handle_change}
                min="1"
              />
            </div>

            <div className="partition">
              <p>Mem per CPU: </p>
              <input
                type="number"
                name="memPerCPU"
                value={formData.memPerCPU}
                onChange={handle_change}
                min="1"
              />
            </div>

            <div className="partition">
              <p>Mail user: </p>
              <input
                type="email"
                name="mailUser"
                value={formData.mailUser}
                onChange={handle_change}
                placeholder="user@example.com"
              />
            </div>

            <div className="partition">
              <p>Mail type: </p>
              {["BEGIN", "END", "FAIL"].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={formData.mailType.includes(type)}
                    onChange={() => handleMailTypeChange(type)}
                  />
                  {type}
                </label>
              ))}
            </div>

            <div className="partition">
              <p>Job time limit: </p>
              <input
                type="number"
                name="jobTimeLimitHours"
                value={formData.jobTimeLimitHours}
                onChange={handle_change}
                min="0"
                max="72"
              />
              <p> hours </p>
              <input
                type="number"
                name="jobTimeLimitMinutes"
                value={formData.jobTimeLimitMinutes}
                onChange={handle_change}
                min="0"
                max="59"
              />
              <p> mins </p>
            </div>
          </div>
        </div>
        <div className="content_right">
          <h2>Script</h2>
          <div className="content_sh">
            <textarea
              readOnly
              value={generateScriptContent()}
              style={{
                width: "100%",
                height: "300px",
                fontFamily: "monospace",
                padding: "10px",
              }}
            />
          </div>
          <div>
            <button className="download_btn" onClick={downloadScript}>
              Download script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
