import axios from "axios";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../store/slices/isLoading.slice";
import { ToastContainer, toast } from "react-toastify";

const QuotesUpload = () => {
  const dispatch = useDispatch();
  const uploadFiles = () => {
    dispatch(setIsLoading(true));

    axios.get("http://localhost:4000/v1/quotes/").then((res) => {
      dispatch(setIsLoading(false));
      toast.success(res.data.message);
    });
  };

  return (
    <div className="container">
      <div className="jumbotron button-container">
        <button
          onClick={() => uploadFiles()}
          className="btn btn-secondary"
          style={{ backgroundColor: "#9aafca" }}
        >
          Add Quotes
        </button>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default QuotesUpload;
