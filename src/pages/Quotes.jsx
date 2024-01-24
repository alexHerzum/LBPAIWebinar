import axios from "axios";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../store/slices/isLoading.slice";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Quotes = () => {
  const [technicalContacts, setTechnicalContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/v1/technical_contacts/")
      .then((res) => setTechnicalContacts(res.data.data.technicalContacts));
  }, []);

  useEffect(() => {
    if (selectedContact) {
      dispatch(setIsLoading(true));
      axios
        .get(
          `http://localhost:4000/v1/quotes/technical-contact/${selectedContact.id}`
        )
        .then((res) => {
          setQuotes(res.data.data);
          dispatch(setIsLoading(false));
        });
    }
  }, [selectedContact]);

  const dispatch = useDispatch();

  return (
    <div className="container">
      <div className="jumbotron button-container">
        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Client
          </button>
          <ul class="dropdown-menu">
            {technicalContacts.map((technicalContact) => (
              <li>
                <a
                  class="dropdown-item"
                  onClick={() => {
                    setSelectedContact(technicalContact);
                  }}
                >
                  {technicalContact.company_name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {selectedContact && (
        <div>
          <h1>{selectedContact.company_name}</h1>
        </div>
      )}
      {quotes.length !== 0 &&
        quotes.map((quote) => (
          <>
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Order Nuber</th>
                  <th scope="col">Partner Name</th>
                  <th scope="col">currency</th>
                  <th scope="col">Total Ex Tax</th>
                  <th scope="col">Total inc Tax</th>
                  <th scope="col">Total Tax</th>
                  <th scope="col">Created Date</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{quote.order_number}</td>
                  <td>{quote.partner_name}</td>
                  <td>{quote.currency}</td>
                  <td>{quote.total_ex_tax}</td>
                  <td>{quote.total_inc_tax}</td>
                  <td>{quote.total_tax}</td>
                  <td>{new Date(quote.created_date).toLocaleDateString()}</td>
                  <td>{new Date(quote.due_date).toLocaleDateString()}</td>
                  <td>
                    {/* <button type="button" class="btn btn-secondary"> */}
                    <Link
                      class="btn btn-secondary"
                      target="_blank"
                      to={`/quotes/${quote.id}`}
                    >
                      See details
                    </Link>
                    {/* </button> */}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ))}
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Quotes;
