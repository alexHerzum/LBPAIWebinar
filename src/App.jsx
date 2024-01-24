import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Quotes from "./pages/Quotes";
import QuoteDetails from "./pages/QuoteDetails";
import Revenue from "./pages/Revenue";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import { useSelector } from "react-redux";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import QuotesUpload from "./pages/QuotesUpload";

function App() {
  const isLoading = useSelector((state) => state.isLoading);

  return (
    <HashRouter>
      {isLoading && <LoadingScreen />}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/quotes-upload" element={<QuotesUpload />} />
        </Route>
        <Route path="/quotes/:quoteId" element={<QuoteDetails />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
