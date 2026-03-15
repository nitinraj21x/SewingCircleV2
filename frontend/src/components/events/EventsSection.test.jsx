import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventsSection from './EventsSection';
import { eventsAPI } from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  eventsAPI: {
    getUpcomingEvents: vi.fn(),
    getPastEvents: vi.fn(),
  },
}));

// Mock the Reveal component to avoid animation issues in tests
vi.mock('../shared/Reveal', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// Mock RegistrationModal
vi.mock('./RegistrationModal', () => ({
  default: () => <div data-testid="registration-modal">Registration Modal</div>,
}));

describe('EventsSection - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state while fetching events', () => {
    // Mock API to return a promise that never resolves (simulating loading)
    eventsAPI.getUpcomingEvents.mockReturnValue(new Promise(() => {}));
    eventsAPI.getPastEvents.mockReturnValue(new Promise(() => {}));

    render(<EventsSection />);

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('should display error message when network error occurs', async () => {
    // Mock API to reject with network error
    const networkError = new Error('Network Error');
    eventsAPI.getUpcomingEvents.mockRejectedValue(networkError);
    eventsAPI.getPastEvents.mockRejectedValue(networkError);

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/Network connection issue/i)).toBeInTheDocument();
    });
  });

  it('should display error message when server error occurs', async () => {
    // Mock API to reject with 500 error
    const serverError = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };
    eventsAPI.getUpcomingEvents.mockRejectedValue(serverError);
    eventsAPI.getPastEvents.mockRejectedValue(serverError);

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/server is experiencing issues/i)).toBeInTheDocument();
    });
  });

  it('should display error message when service is unavailable (404)', async () => {
    // Mock API to reject with 404 error
    const notFoundError = {
      response: {
        status: 404,
        data: { message: 'Not Found' },
      },
    };
    eventsAPI.getUpcomingEvents.mockRejectedValue(notFoundError);
    eventsAPI.getPastEvents.mockRejectedValue(notFoundError);

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/service is currently unavailable/i)).toBeInTheDocument();
    });
  });

  it('should display retry button when error occurs', async () => {
    // Mock API to reject
    const error = new Error('Network Error');
    eventsAPI.getUpcomingEvents.mockRejectedValue(error);
    eventsAPI.getPastEvents.mockRejectedValue(error);

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should retry fetching events when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock to always fail initially
    eventsAPI.getUpcomingEvents.mockRejectedValue(new Error('Network Error'));
    eventsAPI.getPastEvents.mockRejectedValue(new Error('Network Error'));

    render(<EventsSection />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Network connection issue/i)).toBeInTheDocument();
    });

    // Verify initial API calls
    expect(eventsAPI.getUpcomingEvents).toHaveBeenCalledTimes(1);
    expect(eventsAPI.getPastEvents).toHaveBeenCalledTimes(1);

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    // Wait a bit for the retry to trigger
    await waitFor(() => {
      // Verify API was called again (retry happened)
      expect(eventsAPI.getUpcomingEvents).toHaveBeenCalledTimes(2);
      expect(eventsAPI.getPastEvents).toHaveBeenCalledTimes(2);
    });
  });

  it('should display events successfully after successful fetch', async () => {
    const mockUpcomingEvents = [
      {
        id: '1',
        name: 'Test Event',
        date: '2024-03-15',
        time: '10:00 AM',
        venue: 'https://maps.google.com',
        description: 'Test description',
      },
    ];

    const mockPastEvents = [
      {
        id: '2',
        header: 'Past Event',
        coverImage: '/test-image.jpg',
        participants: 20,
        location: 'Test Location',
        gallery: ['/image1.jpg'],
        theme: 'Test Theme',
        fullDescription: 'Test description',
        duration: '2 hours',
        facilitator: 'Test Facilitator',
      },
    ];

    eventsAPI.getUpcomingEvents.mockResolvedValue({ data: mockUpcomingEvents });
    eventsAPI.getPastEvents.mockResolvedValue({ data: mockPastEvents });

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Past Event')).toBeInTheDocument();
    });

    // Should not show error or loading
    expect(screen.queryByText('Loading events...')).not.toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  it('should display "no events" message when no upcoming events are available', async () => {
    eventsAPI.getUpcomingEvents.mockResolvedValue({ data: [] });
    eventsAPI.getPastEvents.mockResolvedValue({ data: [] });

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText(/No upcoming events at the moment/i)).toBeInTheDocument();
      expect(screen.getByText(/No past events to display yet/i)).toBeInTheDocument();
    });
  });

  it('should handle authentication errors appropriately', async () => {
    const authError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };
    eventsAPI.getUpcomingEvents.mockRejectedValue(authError);
    eventsAPI.getPastEvents.mockRejectedValue(authError);

    render(<EventsSection />);

    await waitFor(() => {
      expect(screen.getByText(/Session expired/i)).toBeInTheDocument();
    });
  });
});
