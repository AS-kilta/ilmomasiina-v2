import { FastifyReply, FastifyRequest } from "fastify";
import { CreationAttributes } from "sequelize";

import type { AdminEventResponse, EventCreateBody } from "@tietokilta/ilmomasiina-models";
import { AuditEvent } from "@tietokilta/ilmomasiina-models";
import { getSequelize } from "../../../models";
import { Event } from "../../../models/event";
import { Question } from "../../../models/question";
import { Quota } from "../../../models/quota";
import { basicEventInfoCached, eventDetailsForAdmin, eventDetailsForUserCached } from "../../events/getEventDetails";
import { eventsListForUserCached } from "../../events/getEventsList";
import { toDate } from "../../utils";

export default async function createEvent(
  request: FastifyRequest<{ Body: EventCreateBody }>,
  response: FastifyReply,
): Promise<AdminEventResponse> {
  // Create the event with relations - Sequelize will handle validation
  const event = await getSequelize().transaction(async (transaction) => {
    const created = await Event.create(
      {
        ...request.body,
        // add order to questions and stringify answer options
        questions: request.body.questions
          ? request.body.questions.map((q, order) => ({
              ...q,
              order,
              options: q.options?.length ? q.options : null,
            }))
          : [],
        // add order to quotas
        quotas: request.body.quotas ? request.body.quotas.map((q, order) => ({ ...q, order })) : [],
        date: toDate(request.body.date),
        endDate: toDate(request.body.endDate),
        registrationStartDate: toDate(request.body.registrationStartDate),
        registrationEndDate: toDate(request.body.registrationEndDate),
        dueDate: toDate(request.body.dueDate),
      } as CreationAttributes<Event>,
      {
        transaction,
        include: [
          {
            model: Question,
            required: false,
          },
          {
            model: Quota,
            required: false,
          },
        ],
      },
    );

    await request.logEvent(AuditEvent.CREATE_EVENT, {
      event: created,
      transaction,
    });

    return created;
  });

  eventsListForUserCached.invalidate();
  basicEventInfoCached.invalidate();
  eventDetailsForUserCached.invalidate();

  const eventDetails = await eventDetailsForAdmin(event.id);

  response.status(201);
  return eventDetails;
}
