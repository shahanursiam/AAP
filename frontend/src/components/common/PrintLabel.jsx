import React from 'react';

export const PrintLabel = React.forwardRef(({ sample }, ref) => {
    return (
        <div ref={ref} className="print-label" style={{
            width: '2in',
            height: '3in',
            padding: '2mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            boxSizing: 'border-box',
            pageBreakAfter: 'always',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            backgroundColor: 'white'
        }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>{sample.name}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px', width: '100%', flex: '0 0 auto' }}>
                <img
                    src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${sample.sku}&scale=3&height=8&includetext`}
                    alt="Barcode"
                    style={{ maxWidth: '90%', height: 'auto' }}
                />
            </div>

            <div style={{
                width: '100%',
                flex: '1 1 auto', // Allow this section to grow to fill space
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                alignContent: 'start', // Start from top, let them stack naturally
                gap: '2px',
                fontSize: '9px',
                lineHeight: '1.1',
                overflow: 'hidden'
            }}>
                <div style={{ wordBreak: 'break-word' }}><strong>Style:</strong> {sample.styleNo}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>PO:</strong> {sample.poNumber}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Size:</strong> {sample.size}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Color:</strong> {sample.color}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Buyer:</strong> {sample.buyer}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Season:</strong> {sample.season}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Vendor:</strong> {sample.vendor}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Type:</strong> {sample.sampleType}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Qty:</strong> {sample.quantity}</div>
                <div style={{ wordBreak: 'break-word' }}><strong>Date:</strong> {sample.sampleDate ? sample.sampleDate.split('T')[0] : ''}</div>
                <div style={{ gridColumn: '1 / -1', wordBreak: 'break-word' }}><strong>Fabric:</strong> {sample.fabricDetails}</div>
                <div style={{ gridColumn: '1 / -1', wordBreak: 'break-word' }}><strong>Rmks:</strong> {sample.remarks}</div>
            </div>
        </div>
    );
});
