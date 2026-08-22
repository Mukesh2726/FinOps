import { FileUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NoFinancialData({ title = 'Upload your first bank statement', description = 'Upload a bank statement, invoice, bill, or receipt to generate real financial insights.' }) {
  const navigate = useNavigate();
  return (
    <div className="no-financial-data">
      <div className="no-financial-data-icon"><FileUp size={22} /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="glow-btn glow-btn--primary glow-btn--md" onClick={() => navigate('/upload')}>
        Upload Documents <ArrowRight size={15} />
      </button>
    </div>
  );
}
