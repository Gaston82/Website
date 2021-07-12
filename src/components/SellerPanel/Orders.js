import {React, useState, useEffect} from "react";
import axios from "../../axios";
import Alert from "@material-ui/lab/Alert";
import {makeStyles} from "@material-ui/core/styles";
import UpdateBook from "./UpdateBook";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingTop: "20px",
  },
}));

function Orders() {
  const classes = useStyles();
  const [panel, setpanel] = useState("1");
  const [alert, setalert] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [Adr, setAdr] = useState(null);
  const [bookDetails, setbookDetails] = useState([]);
  const [sold, setsold] = useState([]);
  const [approved, setapproved] = useState([]);
  const [notsold, setnotsold] = useState([]);
  const [update, setupdate] = useState(false);
  const [bookprops, setbookprops] = useState({});

  // fetching adresses and Book Details in sync
  useEffect(() => {
    axios
      .get("/getAddressList")
      .then((addresses) => {
        setAdr(addresses.data);
        axios
          .get("/getBookList")
          .then((response) => {
            setbookDetails(response.data);
            bookSorting(response.data, addresses.data);
          })
          .catch(() => {});
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // sorting books on basis of sold, approved, not approved
  const bookSorting = (books, adr) => {
    for (let i = 0; i < books.length; i++) {
      let tmp = books[i].pickupAddressId;
      for (let j = 0; j < adr.length; j++) {
        if (adr[j]._id === tmp) {
          books[i].addressVal = adr[j].address;
          tmp = -1;
          break;
        }
        if (tmp === -1) break;
      }
    }

    for (let i = 0; i < books.length; i++) {
      if (books[i].isApproved === true) {
        approved.push(books[i]);
        setapproved(approved);
      } else {
        notsold.push(books[i]);
        setnotsold(notsold);
      }
    }
  };

  // deleting books
  const handelBookDelete = (e) => {
    axios
      .delete("/deleteBook", {
        data: {bookId: e.target.id},
      })
      .then((response) => {
        setalert({
          show: true,
          type: "success",
          msg: response.data.msg,
        });
        setnotsold(notsold.filter((book) => e.target.id !== book._id));
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  return (
    <div className="orders-bg">
      <div className="orders-filter">
        <form action="">
          <div className="select-wrapper">
            <select
              className="select"
              onChange={(e) => {
                console.log(e.target.value);
                setpanel(e.target.value);
              }}
            >
              <option value="1">Books Sold</option>
              <option value="2">Book Approved</option>
              <option value="3">Books Pending For Approval</option>
            </select>
          </div>
        </form>
      </div>
      <div
        className={classes.root}
        style={{display: alert.show ? "flex" : "none"}}
      >
        <Alert
          variant="outlined"
          severity={alert.type}
          style={{
            fontFamily: "PT Sans",
            fontWeight: "bold",
            color: alert.type === "success" ? "yellowgreen" : "red",
            width: "500px",
          }}
        >
          {alert.msg}
        </Alert>
      </div>
      <div className="orders-details">
        {panel === "1" ? (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Book ID</th>
                <th>Dated</th>
                <th>Details</th>
                <th>Order Price</th>
                <th>Buyer</th>
                <th>Payment Recieved</th>
              </tr>
            </thead>
          </table>
        ) : panel === "2" ? (
          <table>
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Book Name</th>
                <th>ISBN Number</th>
                <th>Details</th>
                <th>Selling Price</th>
                <th>Quantity</th>
                <th>Remove</th>
              </tr>
            </thead>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Name</th>
                <th>Details</th>
                <th>Price</th>
                <th>Pickup Address</th>
                <th>Status</th>
                <th>Update</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {notsold.length > 0 ? (
                <>
                  {notsold.map((book) => (
                    <tr>
                      <th>{book._id}</th>
                      <th>{book.title}</th>
                      <th>{book.description}</th>
                      <th>{book.price}/-</th>
                      <th>{book.addressVal}</th>
                      <th
                        style={{
                          color: "white",
                          fontFamily: "PT Sans",
                          fontWeight: "bold",
                          backgroundColor: "red",
                        }}
                      >
                        APPROVAL PENDING
                      </th>
                      <th
                        style={{
                          color: "white",
                          fontFamily: "PT Sans",
                          cursor: "pointer",
                          fontWeight: "bold",
                          backgroundColor: "yellowgreen",
                        }}
                        onClick={() => {
                          setbookprops(book);
                          setupdate(true);
                        }}
                      >
                        Update Details
                      </th>
                      <th>
                        <i
                          className="fas fa-window-close"
                          id={book._id}
                          onClick={handelBookDelete}
                        />
                      </th>
                    </tr>
                  ))}
                </>
              ) : (
                <></>
              )}
            </tbody>
          </table>
        )}
      </div>
      {update ? (
        <i
          className="fas fa-window-close"
          onClick={() => {
            setupdate(false);
          }}
          style={{
            position: "absolute",
            float: "left",
            zIndex: "102",
            right: "20px",
          }}
        />
      ) : (
        <></>
      )}
      {update ? <UpdateBook book={bookprops} /> : <></>}
    </div>
  );
}
export default Orders;
