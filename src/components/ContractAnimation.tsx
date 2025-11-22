import Lottie from 'lottie-react';
import contractAnimation from '../assets/animations/contract.json';

export function ContractAnimation() {
  return (
    <div className="relative flex items-center justify-center p-6 md:p-12 h-full">
      <div style={{ maxWidth: 720, width: '100%' }}>
        <Lottie animationData={contractAnimation} loop autoplay />
      </div>
    </div>
  );
}