import axios from "axios";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../store/slices/isLoading.slice";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const QuoteDetails = () => {
  const { quoteId } = useParams();
  const dispatch = useDispatch();

  const [quote, setQuote] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    dispatch(setIsLoading(true));
    axios.get(`http://localhost:4000/v1/quotes/${quoteId}`).then((res) => {
      setQuote(res.data.data);
      dispatch(setIsLoading(false));
    });
    axios.get(`http://localhost:4000/v1/discounts/`).then((res) => {
      setDiscounts(res.data.data.discounts);
      dispatch(setIsLoading(false));
    });
  }, []);

  let rowNumber = 0;

  let listPriceTotal = 0;

  let yourPriceTotal = 0;

  const getClientPrice = (item) => {
    // if (discounts.length !== 0) {
    if (item.quote_discounts.length == 0)
      return Number(item.unit_price).toFixed(2);
    else {
      for (const discount of discounts) {
        console.log(
          discount.atlassian_discount,
          Number(item.quote_discounts[0].percentage).toFixed(2)
        );
        if (
          discount.atlassian_discount ==
          Number(item.quote_discounts[0].percentage).toFixed(2)
        )
          return (
            ((100 - discount.herzum_discount) / 100) *
            item.unit_price
          ).toFixed(2);
      }
    }
  };

  return (
    <div className="container">
      <div className="jumbotron">
        {quote && <div>{<h1>{quote.technical_contact.company_name}</h1>}</div>}
        {quote && (
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
                </tr>
              </tbody>
            </table>
          </>
        )}
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="detailed-info-tab"
              data-bs-toggle="tab"
              data-bs-target="#detailed-info-tab-pane"
              type="button"
              role="tab"
              aria-controls="detailed-info-tab-pane"
              aria-selected="true"
            >
              Detailed Information
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="table-for-word-tab"
              data-bs-toggle="tab"
              data-bs-target="#table-for-word-tab-pane"
              type="button"
              role="tab"
              aria-controls="table-for-word-tab-pane"
              aria-selected="false"
            >
              Table for Word Document
            </button>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div
            class="tab-pane fade show active"
            id="detailed-info-tab-pane"
            role="tabpanel"
            aria-labelledby="detailed-info-tab"
            tabindex="0"
          >
            {quote && (
              <table class="table" style={{ marginBottom: "3rem" }}>
                <thead>
                  <tr>
                    <th scope="col">Product Name</th>
                    <th scope="col">SEN</th>
                    <th scope="col">Platform</th>
                    <th scope="col">Sale Type</th>
                    <th scope="col">Unit Price</th>
                    <th scope="col">Unit Count</th>
                    <th scope="col">Partner Discount</th>
                    <th scope="col">Loyalty Discount</th>
                    <th scope="col">Herzum Cost</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.quote_order_items.map((item) => (
                    <tr>
                      <td>{item.product_name}</td>
                      <td>{item.support_entitlement_number}</td>
                      <td>{item.platform}</td>
                      <td>{item.sale_type}</td>
                      <td>{item.unit_price}</td>
                      <td>{item.unit_count}</td>
                      <td>{item.partner_discount_total}</td>
                      <td>{item.loyalty_discount_total}</td>
                      <td>{item.total}</td>
                      <td>{new Date(item.start_date).toLocaleDateString()}</td>
                      <td>{new Date(item.end_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div
            class="tab-pane fade"
            id="table-for-word-tab-pane"
            role="tabpanel"
            aria-labelledby="table-for-word-tab"
            tabindex="0"
          >
            {quote && (
              <table
                class="word-table"
                style={{ marginBottom: "3rem" }}
                id="table-for-word"
              >
                <thead>
                  <tr>
                    <th scope="col"></th>
                    <th scope="col">Product</th>
                    <th scope="col">List</th>
                    <th scope="col">Your Price</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.quote_order_items.map((item) => {
                    rowNumber += 1;
                    listPriceTotal += Number(item.unit_price);
                    yourPriceTotal += Number(getClientPrice(item));
                    return (
                      <tr>
                        <td>{rowNumber}</td>
                        <td>
                          <p>{`${item.support_entitlement_number}`}</p>
                          <p>{` ${item.product_name} ${item.unit_count} Users: ${item.license_type} License ${item.sale_type}`}</p>
                          <p>{`Licensed To: ${item.licensed_to}`}</p>
                          <p>{`
                          Support Period: 
                          ${new Date(item.start_date).toLocaleDateString(
                            "default",
                            { month: "short" }
                          )} 
                          ${new Date(item.start_date).getDate()},
                          ${new Date(item.start_date).getFullYear()} 
                          - 
                          ${new Date(item.end_date).toLocaleDateString(
                            "default",
                            { month: "short" }
                          )} 
                          ${new Date(item.end_date).getDate()},
                          ${new Date(item.end_date).getFullYear()} 
                         `}</p>
                        </td>
                        <td>${Number(item.unit_price).toFixed(2)}</td>
                        <td>${getClientPrice(item)}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td></td>
                    <td>
                      <b>TOTAL</b>
                    </td>
                    <td>${listPriceTotal.toFixed(2)}</td>
                    <td>${yourPriceTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {/* <button onClick={() => copyTable()}>Copy to clipboard</button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetails;
