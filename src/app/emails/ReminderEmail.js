'use client'
import * as React from 'react';

export const ReminderEmail = ({ payername, amount, reason, senderName, senderEmail }) => (
  <div style={{
    fontFamily: 'Segoe UI, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 8px rgba(0,0,0,0.04)'
  }}>
    <h2 style={{ fontSize: '20px', color: '#111827', marginBottom: '8px' }}>🔔 Payment Reminder</h2>

    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi <strong>{payername}</strong>,
    </p>

    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      This is a gentle reminder that your payment of <strong>₹{amount}</strong> for <em>{`"`}{reason}{`"`}</em> is due.
    </p>

    <div style={{
      margin: '16px 0',
      padding: '12px 16px',
      backgroundColor: '#fef3c7',
      borderLeft: '4px solid #f59e0b',
      borderRadius: '4px'
    }}>
      <p style={{ margin: 0, fontSize: '15px', color: '#92400e' }}>
        Please complete your payment at your earliest convenience.
      </p>
    </div>

    <p style={{ fontSize: '15px', color: '#374151' }}>
      You can reach out to <strong>{senderName}</strong> for more information:
      <br />
      <a href={`mailto:${senderEmail}`} style={{ color: '#2563eb' }}>{senderEmail}</a>
    </p>

    <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

    <p style={{ fontSize: '13px', color: '#6b7280' }}>
      This message was sent automatically by your trusted finance assistant. If you’ve already completed the payment, please disregard this message.
    </p>
  </div>
);
