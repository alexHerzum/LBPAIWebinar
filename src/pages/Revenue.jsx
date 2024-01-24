import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../store/slices/isLoading.slice";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import ErrorHighlighter from "../components/ErrorHighlighter ";
import Papa, { unparse } from "papaparse";

const Revenue = () => {
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const [logs, setLogs] = useState(null);

  const submit = (data) => {
    dispatch(setIsLoading(true));
    setLogs(null);

    axios
      .post("http://localhost:4000/v1/revenue/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setLogs(res.data.logs);
        dispatch(setIsLoading(false));
        toast.success(res.data.message);
        reset();
      });
  };

  const getUnmatchedRevenueItems = () => {
    dispatch(setIsLoading(true));
    axios.get("http://localhost:4000/v1/revenue/unmatched").then((res) => {
      let csv = Papa.unparse(res.data.data);
      const blob = new Blob([csv], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "unmatchedRevenueEntries.csv";
      link.href = url;
      link.click();
      dispatch(setIsLoading(false));
    });
  };

  return (
    <div className="container">
      <div className="jumbotron">
        <div className="button-container">
          <form
            class="row g-3"
            onSubmit={handleSubmit(submit)}
            enctype="multipart/form-data"
          >
            <label for="formFile" class="form-label">
              Upload your Revenue CSV File
            </label>
            <div className="col-auto">
              <input
                class="form-control"
                type="file"
                id="file"
                name="file"
                {...register("file")}
              />
            </div>
            <div className="col-auto">
              <button
                type="submit"
                className="btn btn-secondary"
                style={{ backgroundColor: "#9aafca" }}
              >
                Upload
              </button>
            </div>
          </form>
          <button
            onClick={() => getUnmatchedRevenueItems()}
            className="btn btn-secondary"
            style={{ backgroundColor: "#9aafca" }}
          >
            Get Unmatched Revenue Entries
          </button>
        </div>

        {logs && (
          <div className="revenue-logs">
            <h2>Logs</h2>
            {logs.map((log) => (
              <ErrorHighlighter text={log} />
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Revenue;
