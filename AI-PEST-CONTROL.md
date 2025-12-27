# Bryntum AI Pest Control Scheduling

Dit document beschrijft de AI-powered field service scheduling voor pest control en vergelijkbare domein-specifieke applicaties met Bryntum Calendar.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Domain-Specific Scheduling](#domain-specific-scheduling)
3. [AI Route Optimization](#ai-route-optimization)
4. [Technician Matching](#technician-matching)
5. [Customer Communication](#customer-communication)
6. [Backend Implementatie](#backend-implementatie)

---

## Overzicht

De AI Pest Control demo toont hoe Bryntum Calendar kan worden gecombineerd met AI voor domein-specifieke field service scheduling, inclusief route optimalisatie, technician matching, en geautomatiseerde klantcommunicatie.

### Architectuur

```
┌────────────────────────────────────────────────────────────────┐
│               AI Pest Control Scheduling                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Customer Request                        │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │   │
│  │  │ Address   │  │  Problem  │  │    Preferences    │    │   │
│  │  │           │  │   Type    │  │    (time/tech)    │    │   │
│  │  └───────────┘  └───────────┘  └───────────────────┘    │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  AI Scheduling Engine                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │    Route     │  │  Technician  │  │    Time      │   │   │
│  │  │ Optimization │  │   Matching   │  │  Estimation  │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Bryntum Calendar View                      │   │
│  │  • Day/Week/Month views                                  │   │
│  │  • Technician resource columns                           │   │
│  │  • Drag-drop scheduling                                  │   │
│  │  • Route visualization                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Domain-Specific Scheduling

### Service Request Model

```javascript
// lib/models/ServiceRequest.js
import { EventModel } from '@bryntum/calendar';

class ServiceRequest extends EventModel {
    static fields = [
        // Klant informatie
        { name: 'customerName' },
        { name: 'customerPhone' },
        { name: 'customerEmail' },

        // Locatie
        { name: 'address' },
        { name: 'city' },
        { name: 'zipCode' },
        { name: 'coordinates', type: 'object' }, // { lat, lng }

        // Service details
        { name: 'serviceType' }, // rodent, insect, termite, etc.
        { name: 'problemDescription' },
        { name: 'severity' }, // low, medium, high, emergency
        { name: 'isRecurring', type: 'boolean' },
        { name: 'treatmentHistory', type: 'array' },

        // Scheduling
        { name: 'preferredTimeSlots', type: 'array' },
        { name: 'estimatedDuration' }, // in minutes
        { name: 'actualDuration' },

        // Technician
        { name: 'assignedTechId' },
        { name: 'requiredSkills', type: 'array' },
        { name: 'requiredEquipment', type: 'array' },

        // Status
        { name: 'status' }, // scheduled, in-progress, completed, cancelled
        { name: 'completionNotes' },
        { name: 'customerRating', type: 'number' }
    ];

    // Computed properties
    get isUrgent() {
        return this.severity === 'emergency' || this.severity === 'high';
    }

    get needsSpecialist() {
        return ['termite', 'wildlife'].includes(this.serviceType);
    }
}
```

### Technician Resource Model

```javascript
// lib/models/Technician.js
import { ResourceModel } from '@bryntum/calendar';

class Technician extends ResourceModel {
    static fields = [
        { name: 'name' },
        { name: 'phone' },
        { name: 'email' },

        // Skills & certifications
        { name: 'skills', type: 'array' }, // rodent, insect, termite, wildlife
        { name: 'certifications', type: 'array' },
        { name: 'experienceLevel' }, // junior, mid, senior

        // Location
        { name: 'homeBase', type: 'object' }, // { lat, lng }
        { name: 'currentLocation', type: 'object' },
        { name: 'serviceRadius' }, // km

        // Availability
        { name: 'workingHours', type: 'object' }, // { start: '08:00', end: '17:00' }
        { name: 'unavailableDates', type: 'array' },

        // Performance
        { name: 'avgServiceTime' },
        { name: 'customerRating', type: 'number' },
        { name: 'completedJobsCount', type: 'number' }
    ];

    canHandle(serviceRequest) {
        // Check skills match
        const requiredSkills = serviceRequest.requiredSkills || [serviceRequest.serviceType];
        return requiredSkills.every(skill => this.skills.includes(skill));
    }
}
```

---

## AI Route Optimization

### Route Optimizer Service

```javascript
// lib/AIRouteOptimizer.js
class AIRouteOptimizer {
    constructor(config = {}) {
        this.apiEndpoint = config.apiEndpoint || '/api/ai-routing';
        this.maxJobsPerDay = config.maxJobsPerDay || 8;
    }

    /**
     * Optimaliseer route voor een technicus
     */
    async optimizeRoute(technician, jobs, date) {
        // Filter jobs voor de specifieke datum
        const dayJobs = jobs.filter(job =>
            job.startDate.toDateString() === date.toDateString()
        );

        if (dayJobs.length <= 1) {
            return dayJobs;
        }

        const response = await fetch(`${this.apiEndpoint}/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                technician: {
                    homeBase: technician.homeBase,
                    currentLocation: technician.currentLocation || technician.homeBase
                },
                jobs: dayJobs.map(job => ({
                    id: job.id,
                    address: job.address,
                    coordinates: job.coordinates,
                    estimatedDuration: job.estimatedDuration,
                    timeWindow: job.preferredTimeSlots?.[0] || null,
                    priority: this.getPriorityScore(job)
                })),
                constraints: {
                    maxDrivingTime: 120, // max 2 uur rijden per dag
                    workingHours: technician.workingHours,
                    breakTime: 30 // 30 min lunch
                },
                prompt: 'Optimize this route for minimum travel time while respecting time windows and priorities'
            })
        });

        const result = await response.json();
        return this.applyOptimizedOrder(dayJobs, result.optimizedOrder);
    }

    /**
     * Bereken priority score
     */
    getPriorityScore(job) {
        const scores = {
            'emergency': 100,
            'high': 75,
            'medium': 50,
            'low': 25
        };
        return scores[job.severity] || 50;
    }

    /**
     * Pas geoptimaliseerde volgorde toe
     */
    applyOptimizedOrder(jobs, optimizedOrder) {
        return optimizedOrder.map(orderedJob => {
            const job = jobs.find(j => j.id === orderedJob.id);
            return {
                ...job,
                suggestedStartTime: new Date(orderedJob.suggestedStartTime),
                estimatedArrival: new Date(orderedJob.estimatedArrival),
                travelTimeFromPrevious: orderedJob.travelTime
            };
        });
    }

    /**
     * Herbereken route bij wijziging
     */
    async recalculateOnChange(technician, jobs, changedJob) {
        // Haal geaffecteerde jobs op
        const affectedJobs = jobs.filter(job =>
            job.startDate >= changedJob.startDate
        );

        return this.optimizeRoute(technician, affectedJobs, changedJob.startDate);
    }

    /**
     * Bereken reistijd tussen twee locaties
     */
    async calculateTravelTime(from, to) {
        const response = await fetch(`${this.apiEndpoint}/travel-time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to })
        });

        return response.json();
    }
}
```

### Route Visualization

```javascript
// lib/RouteVisualizer.js
class RouteVisualizer {
    constructor(calendar, mapWidget) {
        this.calendar = calendar;
        this.mapWidget = mapWidget;
    }

    /**
     * Toon route op kaart
     */
    displayRoute(technician, jobs) {
        const waypoints = [
            technician.homeBase,
            ...jobs.map(job => job.coordinates),
            technician.homeBase // Return home
        ];

        this.mapWidget.showRoute(waypoints, {
            color: this.getTechnicianColor(technician),
            markers: jobs.map((job, index) => ({
                position: job.coordinates,
                label: (index + 1).toString(),
                popup: `${job.customerName} - ${job.serviceType}`
            }))
        });
    }

    /**
     * Update route realtime
     */
    updateTechnicianPosition(technician, currentPosition) {
        this.mapWidget.updateMarker(`tech-${technician.id}`, {
            position: currentPosition,
            icon: 'truck'
        });

        // Herbereken ETA voor volgende jobs
        this.updateETAs(technician, currentPosition);
    }

    getTechnicianColor(technician) {
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33'];
        return colors[technician.id % colors.length];
    }
}
```

---

## Technician Matching

### AI Matching Service

```javascript
// lib/AITechnicianMatcher.js
class AITechnicianMatcher {
    constructor(config = {}) {
        this.apiEndpoint = config.apiEndpoint || '/api/ai-matching';
    }

    /**
     * Vind beste technicus voor een job
     */
    async findBestMatch(serviceRequest, availableTechnicians) {
        const scoredTechnicians = await Promise.all(
            availableTechnicians.map(async tech => ({
                technician: tech,
                score: await this.calculateMatchScore(tech, serviceRequest)
            }))
        );

        // Sorteer op score
        scoredTechnicians.sort((a, b) => b.score.total - a.score.total);

        return scoredTechnicians.slice(0, 3); // Top 3 matches
    }

    /**
     * Bereken match score
     */
    async calculateMatchScore(technician, serviceRequest) {
        const scores = {
            skillMatch: this.calculateSkillScore(technician, serviceRequest),
            proximityScore: await this.calculateProximityScore(technician, serviceRequest),
            availabilityScore: this.calculateAvailabilityScore(technician, serviceRequest),
            performanceScore: this.calculatePerformanceScore(technician),
            workloadBalance: this.calculateWorkloadScore(technician)
        };

        // Gewogen gemiddelde
        const weights = {
            skillMatch: 0.3,
            proximityScore: 0.25,
            availabilityScore: 0.2,
            performanceScore: 0.15,
            workloadBalance: 0.1
        };

        scores.total = Object.entries(weights).reduce(
            (total, [key, weight]) => total + scores[key] * weight,
            0
        );

        return scores;
    }

    calculateSkillScore(technician, request) {
        if (!technician.canHandle(request)) return 0;

        const requiredSkills = request.requiredSkills || [request.serviceType];
        const matchingSkills = requiredSkills.filter(
            skill => technician.skills.includes(skill)
        );

        return (matchingSkills.length / requiredSkills.length) * 100;
    }

    async calculateProximityScore(technician, request) {
        if (!request.coordinates || !technician.homeBase) return 50;

        const distance = await this.getDistance(
            technician.currentLocation || technician.homeBase,
            request.coordinates
        );

        // Score gebaseerd op afstand (max 50km = 0 score)
        return Math.max(0, 100 - (distance / 50) * 100);
    }

    calculateAvailabilityScore(technician, request) {
        const preferredTimes = request.preferredTimeSlots || [];
        if (preferredTimes.length === 0) return 100;

        // Check of technicus beschikbaar is in preferred times
        const available = preferredTimes.some(slot =>
            this.isAvailableAt(technician, slot)
        );

        return available ? 100 : 50;
    }

    calculatePerformanceScore(technician) {
        const rating = technician.customerRating || 4;
        return (rating / 5) * 100;
    }

    calculateWorkloadScore(technician) {
        // Balanceer workload - prefer technicians met minder jobs
        const todayJobCount = technician.todayJobCount || 0;
        const maxJobs = 8;

        return ((maxJobs - todayJobCount) / maxJobs) * 100;
    }

    async getDistance(from, to) {
        // Gebruik AI of externe API voor afstandsberekening
        const response = await fetch(`${this.apiEndpoint}/distance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to })
        });

        const result = await response.json();
        return result.distance; // in km
    }

    isAvailableAt(technician, timeSlot) {
        // Check working hours en bestaande afspraken
        return true; // Simplified
    }
}
```

---

## Customer Communication

### AI Communication Service

```javascript
// lib/AICustomerCommunication.js
class AICustomerCommunication {
    constructor(config = {}) {
        this.apiEndpoint = config.apiEndpoint || '/api/ai-communication';
        this.companyName = config.companyName || 'Pest Control Pro';
    }

    /**
     * Genereer appointment confirmatie
     */
    async generateConfirmation(appointment) {
        const response = await fetch(`${this.apiEndpoint}/generate-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'confirmation',
                data: {
                    customerName: appointment.customerName,
                    date: appointment.startDate,
                    timeWindow: `${this.formatTime(appointment.startDate)} - ${this.formatTime(appointment.endDate)}`,
                    technicianName: appointment.technician?.name,
                    serviceType: appointment.serviceType,
                    address: appointment.address
                },
                prompt: `Generate a professional appointment confirmation message for ${this.companyName}.
                         Include the date, time window, technician name, and service type.
                         Be friendly but professional.`
            })
        });

        return response.json();
    }

    /**
     * Genereer reminder
     */
    async generateReminder(appointment, hoursBeforeAction = 24) {
        const response = await fetch(`${this.apiEndpoint}/generate-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'reminder',
                data: {
                    customerName: appointment.customerName,
                    date: appointment.startDate,
                    timeWindow: `${this.formatTime(appointment.startDate)} - ${this.formatTime(appointment.endDate)}`,
                    serviceType: appointment.serviceType
                },
                prompt: `Generate a friendly reminder for an upcoming pest control appointment.
                         The appointment is in ${hoursBeforeAction} hours.
                         Include preparation instructions if relevant.`
            })
        });

        return response.json();
    }

    /**
     * Genereer ETA update
     */
    async generateETAUpdate(appointment, newETA, reason) {
        const response = await fetch(`${this.apiEndpoint}/generate-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'eta_update',
                data: {
                    customerName: appointment.customerName,
                    originalTime: appointment.startDate,
                    newETA,
                    technicianName: appointment.technician?.name,
                    reason
                },
                prompt: `Generate a polite ETA update message.
                         Apologize for any inconvenience and provide the new arrival time.`
            })
        });

        return response.json();
    }

    /**
     * Genereer follow-up survey
     */
    async generateFollowUp(completedAppointment) {
        const response = await fetch(`${this.apiEndpoint}/generate-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'follow_up',
                data: {
                    customerName: completedAppointment.customerName,
                    serviceType: completedAppointment.serviceType,
                    technicianName: completedAppointment.technician?.name,
                    completionDate: completedAppointment.endDate
                },
                prompt: `Generate a follow-up message asking about the customer's satisfaction.
                         Include a link to leave a review (placeholder).
                         Offer to schedule a follow-up if needed.`
            })
        });

        return response.json();
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
```

---

## Backend Implementatie

### Node.js Pest Control Service

```javascript
// server/ai-pest-control.js
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Route optimization endpoint
app.post('/api/ai-routing/optimize', async (req, res) => {
    const { technician, jobs, constraints, prompt } = req.body;

    const systemPrompt = `
        You are a route optimization assistant for a pest control company.
        Optimize the given jobs for minimum travel time while respecting:
        - Time windows
        - Job priorities
        - Working hours
        - Required break time

        Return JSON:
        {
            "optimizedOrder": [
                { "id": "job_id", "suggestedStartTime": "ISO datetime", "estimatedArrival": "ISO datetime", "travelTime": minutes }
            ],
            "totalTravelTime": minutes,
            "estimatedEndTime": "ISO datetime"
        }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `
                        Technician home base: ${JSON.stringify(technician.homeBase)}
                        Jobs: ${JSON.stringify(jobs)}
                        Constraints: ${JSON.stringify(constraints)}

                        ${prompt}
                    `
                }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
        });

        res.json(JSON.parse(response.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Customer communication endpoint
app.post('/api/ai-communication/generate-message', async (req, res) => {
    const { type, data, prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a customer communication assistant for a pest control company.'
                },
                {
                    role: 'user',
                    content: `
                        Message type: ${type}
                        Data: ${JSON.stringify(data)}

                        ${prompt}
                    `
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        res.json({
            message: response.choices[0].message.content,
            type
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

---

## Gerelateerde Documentatie

- [AI-CALENDAR-ASSISTANT.md](./AI-CALENDAR-ASSISTANT.md) - Calendar AI features
- [AI-SKILL-MATCHING.md](./AI-SKILL-MATCHING.md) - Skill matching
- [CALENDAR-IMPL-RESOURCES.md](./CALENDAR-IMPL-RESOURCES.md) - Resource management

---

*Gegenereerd op basis van Bryntum Calendar 7.1.0 trial*
*Bron: examples/ai-pest-control/*
