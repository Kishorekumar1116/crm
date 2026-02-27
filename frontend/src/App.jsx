import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateJob from "./pages/CreateJob";
import Customers from "./pages/Customers";
import Invoice from "./pages/Invoice";
import Quotation from "./pages/Quotation";
import InvoiceList from "./pages/InvoiceList";
import QuotationList from "./pages/QuotationList";
import EditInvoice from "./pages/EditInvoice";
import EditCustomer from "./pages/EditCustomer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/quotation" element={<Quotation />} />
        <Route path="/all-invoices" element={<InvoiceList />} />
        <Route path="/quotation-list" element={<QuotationList />} />
        <Route path="/invoice/edit/:id" element={<EditInvoice />} />
        <Route path="/edit-customer/:id" element={<EditCustomer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
