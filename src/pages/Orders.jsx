import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../store/slices/isLoading.slice";
import { ToastContainer, toast } from "react-toastify";
import ErrorHighlighter from "../components/ErrorHighlighter ";
import Papa, { unparse } from "papaparse";

const Orders = () => {
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const [logs, setLogs] = useState(null);

  const unnestJson = (json) => {
    let newJson = [];
    json.forEach((obj) => {
      let unestedobj = {};
      const keys = Object.keys(obj);
      keys.forEach((key) => {
        if (key === "revenue") {
          const revenue = obj[key];
          const revKeys = Object.keys(revenue);
          revKeys.forEach((revKey) => {
            if (revKey !== "id") {
              unestedobj[revKey] = revenue[revKey];
            }
          });
        } else if (key === "order") {
          const revenue = obj[key];
          const revKeys = Object.keys(revenue);
          revKeys.forEach((revKey) => {
            if (revKey !== "id") {
              if (revKey === "technical_contact") {
                unestedobj["company_name"] = revenue[revKey]["company_name"];
              } else {
                unestedobj[revKey] = revenue[revKey];
              }
            }
          });
        } else {
          unestedobj[key] = obj[key];
        }
      });

      newJson.push(unestedobj);
    });
    return newJson;
  };

  const uploadFiles = () => {
    setLogs(null);
    dispatch(setIsLoading(true));
    axios.post("http://localhost:4000/v1/orders/").then((res) => {
      setLogs(res.data.logs);
      dispatch(setIsLoading(false));
      toast.success(res.data.message);
    });
  };

  const getMatchedOrderItems = () => {
    dispatch(setIsLoading(true));
    axios.get("http://localhost:4000/v1/orders/matched").then((res) => {
      let csv = Papa.unparse(unnestJson(res.data.data));
      const blob = new Blob([csv], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "matchedOrderItems.csv";
      link.href = url;
      link.click();
      dispatch(setIsLoading(false));
    });
  };

  const getUnmatchedOrderItems = () => {
    dispatch(setIsLoading(true));
    axios.get("http://localhost:4000/v1/orders/unmatched").then((res) => {
      let csv = Papa.unparse(unnestJson(res.data.data));
      const blob = new Blob([csv], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "unmatchedOrderItems.csv";
      link.href = url;
      link.click();
      dispatch(setIsLoading(false));
    });
  };

  const submit = (data) => {
    dispatch(setIsLoading(true));
    setLogs(null);

    axios
      .post("http://localhost:4000/v1/orders/manual-match", data, {
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

  return (
    <div className="container">
      <div className="jumbotron ">
        <div className="button-container">
          <form
            class="row g-3"
            onSubmit={handleSubmit(submit)}
            enctype="multipart/form-data"
          >
            <label for="formFile" class="form-label">
              Manually match by CSV File
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
            onClick={() => uploadFiles()}
            className="btn btn-secondary"
            style={{ backgroundColor: "#9aafca" }}
          >
            Add Orders
          </button>
          <button
            onClick={() => getMatchedOrderItems()}
            className="btn btn-secondary"
            style={{ backgroundColor: "#9aafca" }}
          >
            Get Matched Order Items
          </button>
          <button
            onClick={() => getUnmatchedOrderItems()}
            className="btn btn-secondary"
            style={{ backgroundColor: "#9aafca" }}
          >
            Get Unmatched Order Items
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

export default Orders;
