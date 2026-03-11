import React from 'react';
import { Cpu } from 'lucide-react';
import Reveal from '../shared/Reveal';

const FutureSection = React.memo(() => {
  return (
    <section id="future" className="future-section">
      <div className="section-container">
        <div className="future-container">
          {/* Background decorative CPU icon */}
          <div className="future-bg-icon">
            <Cpu size={200} />
          </div>
          
          <div className="future-content">
            {/* Left column: AI integration description */}
            <Reveal>
              <div>
                {/* AI badge indicator */}
                <div className="ai-badge">
                  <span className="ai-badge-dot"></span>
                  AI Powered Assistant
                </div>
                
                <h3 className="future-title">
                  Next-Gen Knowledge Sharing
                </h3>
                
                {/* Detailed description of AI integration plans */}
                <p className="future-description">
                  As The Sewing Circle grows, we plan to integrate technology to enhance our mission. Collaborating with PhD experts, we aim to develop an AI-powered IT information assistant, akin to ChatGPT. This assistant will provide real-time IT-related information, aiding individuals and businesses in navigating the evolving tech landscape.
                </p>
                <p className="future-description">
                  By merging advanced AI capabilities with our community-driven approach, we seek to bolster knowledge sharing, support professional growth, and create a digital platform that complements our in-person gatherings. This initiative aligns with current trends where AI agents are being developed to enhance workplace productivity by automating tasks and collaborating with human employees.
                </p>
                <p className="future-description">
                  Companies like ServiceNow and Salesforce are using AI to handle customer support and draft communications, reflecting the potential of AI in augmenting human efforts.
                </p>
              </div>
            </Reveal>

            {/* Right column: AI chat interface mockup */}
            <Reveal delay={200} className="relative">
              <div className="ai-demo">
                {/* Mock browser window header */}
                <div className="ai-demo-header">
                  <div className="ai-demo-dots">
                    <div className="ai-demo-dot red"></div>
                    <div className="ai-demo-dot yellow"></div>
                    <div className="ai-demo-dot green"></div>
                  </div>
                  <div className="ai-demo-title">Sewing Circle AI Assistant</div>
                </div>
                
                {/* Mock chat conversation */}
                <div className="ai-chat">
                  <div className="ai-message user">
                    <div className="ai-avatar user"></div>
                    <div className="ai-message-content">
                      How can I improve team collaboration in remote work?
                    </div>
                  </div>
                  
                  <div className="ai-message ai">
                    <div className="ai-avatar ai">AI</div>
                    <div className="ai-message-content">
                      Based on Sewing Circle principles, I recommend implementing regular virtual coffee chats, creating shared digital spaces for informal conversations, and establishing mentorship programs that foster genuine connections beyond work tasks.
                    </div>
                  </div>
                </div>
                
                {/* Glowing border effect */}
                <div className="ai-demo-glow"></div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FutureSection;