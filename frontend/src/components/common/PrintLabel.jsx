import React from 'react';

export const PrintLabel = React.forwardRef(({ sample }, ref) => {
    return (
        <div ref={ref} className="print-label" style={{
            width: '2in',
            height: '3in',
            padding: '0.1in',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #ccc', // Optional: remove for actual printing
            boxSizing: 'border-box',
            pageBreakAfter: 'always',
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: 'bold', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sample.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2px' }}>
                <img
                    src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${sample.itemNumber}&scale=2&height=4&includetext`}
                    alt="Barcode"
                    style={{ width: '70%', height: 'auto', maxHeight: '0.6in' }}
                />
            </div>
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', fontSize: '8px', lineHeight: '1.1' }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Style:</strong> {sample.styleNo}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>PO:</strong> {sample.poNumber}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Size:</strong> {sample.size}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Color:</strong> {sample.color}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Buyer:</strong> {sample.buyer}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Season:</strong> {sample.season}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Vendor:</strong> {sample.vendor}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Type:</strong> {sample.sampleType}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Qty:</strong> {sample.quantity}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Date:</strong> {sample.sampleDate ? sample.sampleDate.split('T')[0] : ''}</div>
                <div style={{ gridColumn: '1 / -1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Fabric:</strong> {sample.fabricDetails}</div>
                <div style={{ gridColumn: '1 / -1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Rmks:</strong> {sample.remarks}</div>
            </div>
        </div>
    );
});
