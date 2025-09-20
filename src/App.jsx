import React, { useState, useEffect } from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import './App.css';

const App = () => {
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [items, setItems] = useState([{ name: '', price: '' }]);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1YYSdt9iwLpGu08LQyHQfybV-VcGmHQSLPyYP9wZyA6VhWcmfPdcFDu835aXnCfkA/exec';

  const defaultItems = [
    { name: 'Item 1', price: 100 },
    { name: 'Item 2', price: 150 },
    { name: 'Item 3', price: 200 },
    { name: 'Item 4', price: 250 },
    { name: 'Item 5', price: 300 },
    { name: 'Item 6', price: 350 },
    { name: 'Item 7', price: 400 },
    { name: 'Item 8', price: 450 },
  ];

  const handleAddItem = () => setItems([...items, { name: '', price: '' }]);
  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const newItems = [...items];
    newItems[index][name] = value;

    if (name === 'name') {
      const selectedItem = defaultItems.find((i) => i.name === value);
      if (selectedItem) newItems[index].price = selectedItem.price;
      else newItems[index].price = '';
    }

    setItems(newItems);
  };

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (isNaN(parseFloat(item.price)) ? 0 : parseFloat(item.price)), 0);
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
      // Redirect to WhatsApp after submission
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

          {/* Items */}
          <div className="section">
            <h2>Items</h2>
            {items.map((item, index) => (
              <div className="item-row" key={index}>
                <select
                  name="name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                >
                  <option value="">Select Item</option>
                  {defaultItems.map((dItem, idx) => (
                    <option key={idx} value={dItem.name}>
                      {dItem.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
                <button type="button" onClick={() => handleRemoveItem(index)} className="remove-btn">
                  <MinusCircle size={18} />
                </button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={handleAddItem}>
              <PlusCircle size={20} /> Add Item
            </button>
          </div>
        </form>
      </div>

      {/* Sticky Total & Submit Button */}
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
