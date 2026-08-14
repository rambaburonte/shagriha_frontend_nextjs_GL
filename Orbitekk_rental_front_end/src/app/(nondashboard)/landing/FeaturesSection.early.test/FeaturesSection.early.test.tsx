import "@testing-library/jest-dom";
import { render, screen } from '@testing-library/react';
import FeaturesSection from '../FeaturesSection';

jest.mock('framer-motion', () => ({
  __esModule: true,
  default: {},
}));

describe('FeaturesSection() FeaturesSection method', () => {
  describe('Happy Paths', () => {
    /**
     * This test ensures that the FeaturesSection component renders successfully
     * and displays the expected static content.
     */
    it('renders the FeaturesSection and displays the correct text', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Features Section')).toBeInTheDocument();
    });

    /**
     * This test ensures that FeaturesSection can be rendered as a child
     * within a parent component, and its content is still visible.
     */
    it('renders FeaturesSection as a child in a parent component', () => {
      const Parent = () => (
        <div>
          <h1>Parent</h1>
          <FeaturesSection />
        </div>
      );
      render(<Parent />);
      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.getByText('Features Section')).toBeInTheDocument();
    });

    /**
     * This test ensures that FeaturesSection can be rendered alongside other sibling components
     * and its content does not interfere with siblings.
     */
    it('renders FeaturesSection alongside sibling components', () => {
      const Sibling = () => <div>Sibling Component</div>;
      render(
        <div>
          <Sibling />
          <FeaturesSection />
        </div>
      );
      expect(screen.getByText('Sibling Component')).toBeInTheDocument();
      expect(screen.getByText('Features Section')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    /**
     * This test ensures that FeaturesSection renders correctly even if the parent
     * component passes unexpected props (which FeaturesSection ignores).
     */
    it('renders FeaturesSection when parent passes extra props', () => {
      const Parent = () => (
        <div>
          <FeaturesSection someUnexpectedProp="unexpected" />
        </div>
      );
      render(<Parent />);
      expect(screen.getByText('Features Section')).toBeInTheDocument();
    });

    /**
     * This test ensures that FeaturesSection renders correctly when used multiple times
     * in the same parent, confirming no state or rendering conflicts.
     */
    it('renders multiple FeaturesSection components in the same parent', () => {
      render(
        <div>
          <FeaturesSection />
          <FeaturesSection />
        </div>
      );
      const featuresSections = screen.getAllByText('Features Section');
      expect(featuresSections.length).toBe(2);
    });

    /**
     * This test ensures that FeaturesSection renders correctly even if the parent
     * component conditionally renders it (e.g., based on a boolean).
     */
    it('conditionally renders FeaturesSection based on parent state', () => {
      const Parent = ({ show }: { show: boolean }) => (
        <div>
          {show && <FeaturesSection />}
        </div>
      );
      const { rerender } = render(<Parent show={false} />);
      expect(screen.queryByText('Features Section')).not.toBeInTheDocument();

      rerender(<Parent show={true} />);
      expect(screen.getByText('Features Section')).toBeInTheDocument();
    });
  });
});