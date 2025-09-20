import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import './App.css';

const App = () => {
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycby1YYSdt9iwLpGu08LQyHQfybV-VcGmHQSLPyYP9wZyA6VhWcmfPdcFDu835aXnCfkA/exec';

  const defaultItems = [
    { name: 'Dress', price: 0 },
    { name: 'Top', price: 0 },
    { name: 'lagins', price: 0 },
    { name: 'Plazzo', price: 0 },
    { name: 'Bag', price: 0 },
    { name: 'Chunri', price: 0 },
    { name: 'Jens', price: 0 },
    { name: 'Other', price: 0 },
  ];

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedItem(value);
    const found = defaultItems.find((i) => i.name === value);
    setSelectedPrice(found ? found.price : '');
  };

  const handleAddItem = () => {
    if (!selectedItem || !selectedPrice) return;

    setItems((prev) => [...prev, { name: selectedItem, price: selectedPrice }]);
    setSelectedItem('');
    setSelectedPrice('');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const newTotal = items.reduce(
      (sum, item) => sum + (isNaN(parseFloat(item.price)) ? 0 : parseFloat(item.price)),
      0
    );
    setTotal(newTotal);
  }, [items]);

  const generateWhatsAppMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Hello';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';

    let message = `${greeting} ${customerName},\n\n`;
    message += `--- YOUR BILL SUMMARY ---\n`;
    message += `Date: ${now.toLocaleDateString()}\n\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}: ₹${item.price}\n`;
      message += `-------------------------\n`;
    });
    message += `Total: ₹${total.toFixed(2)}\n`;
    message += `-------------------------\n`;
    message += `Thank you for your purchase!\nVisit Again!\n\n- Yogesh Mundhe`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one item before generating the bill.');
      return;
    }

    setIsSubmitting(true);

    const formattedNumber = `91${whatsappNumber}`;
    const message = generateWhatsAppMessage();
    const whatsappLink = `https://wa.me/${formattedNumber}?text=${message}`;

    const data = { customerName, whatsappNumber: formattedNumber, items, total, timestamp: new Date().toISOString() };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      window.open(whatsappLink, '_blank');
    } catch (error) {
      console.error('Error sending data:', error);
      alert('Error sending data to Google Sheets.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-card">
        <h1 className="app-title">Yogesh Mundhe</h1>

        <form onSubmit={handleSubmit} className="app-form">
          {/* Customer Info */}
          <div className="section">
            <h2>Customer Info</h2>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="WhatsApp Number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
            />
          </div>

          {/* Single Input Row */}
          <div className="section">
            <h2>Add Item</h2>
            <div className="single-input-row">
              <select value={selectedItem} onChange={handleSelectChange}>
                <option value="">Select Item</option>
                {defaultItems.map((dItem, idx) => (
                  <option key={idx} value={dItem.name}>
                    {dItem.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
              />
              <button type="button" className="add-btn" onClick={handleAddItem}>
                <ShoppingCart color="#04348c" />
              </button>
            </div>
          </div>

          {/* Bill Preview Section */}
          {items.length > 0 && (
            <div className="bill-section">
              <h2>Bill</h2>
              <ul>
                {items.map((item, index) => (
                  <li key={index}>
                    <span>
                      {item.name} - ₹{item.price}
                    </span>
                    <button type="button" onClick={() => handleRemoveItem(index)}>
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>

      {/* Sticky Footer */}
      <div className="sticky-footer">
        <div className="total-row">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'WhatsApp Bill'}
        </button>
      </div>
    </div>
  );
};

export default App;