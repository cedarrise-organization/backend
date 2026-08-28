import * as p from "drizzle-orm/pg-core";
import { index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  updatedAt: p.timestamp("updated_at"),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  deletedAt: p.timestamp("deleted_at"),
};

export const receipts = p.pgTable(
  "receipts",
  {
    id: p
      .uuid()
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    name: p.text().notNull(),
    amount: p.numeric({ mode: "number" }).notNull(),
    description: p.text(),
    uploadedBy: p.text("uploaded_by").notNull(),
    imageUrl: p.text("image_url").notNull(),
    imagePublicId: p.text("image_public_id").notNull(),
    ...timestamps,
  },
  (table) => [
    index("receipts_name_idx").on(table.name),
    index("receipts_amount_idx").on(table.amount),
    index("receipts_description_idx").on(table.description),
    index("receipts_uploadedBy_idx").on(table.uploadedBy),
    index("receipts_createdAt_idx").on(table.createdAt),
    index("receipts_search_index").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A') ||
        setweight(to_tsvector('english', ${table.uploadedBy}), 'A') ||
        setweight(to_tsvector('english', coalesce(${table.amount}::text, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${table.description}, '')), 'C') 
      )`,
    ),
  ],
);

export const googleForms = p.pgTable("google_forms", {
  id: p
    .uuid()
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
  title: p.text().notNull(),
  src: p.text().notNull(),
  description: p.text(),
  deadline: p.timestamp(),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
});

export const miscellaneous = p.pgTable(
  "miscellaneous",
  {
    id: p
      .uuid()
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    numberOfPhotos: p.integer("number_of_photos").default(260).notNull(),
    numberOfPartners: p.integer("number_of_partners").default(0),
  },
  (table) => [
    index("photo_count_index").on(table.numberOfPhotos),
    index("partner_count_index").on(table.numberOfPartners),
  ],
);

export const impactMetrics = p.pgTable(
  "impact_metrics",
  {
    id: p
      .uuid()
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    // HOME
    totalBeneficiaries: p.numeric("total_beneficiaries", { mode: "number" }).default(1193).notNull(),
    communitiesImpacted: p.numeric("communities_impacted", { mode: "number" }).default(7).notNull(),
    yearsOfImpact: p.numeric("years_of_impact", { mode: "number" }).default(3).notNull(),
    volunteersEngaged: p.numeric("volunteers_engaged", { mode: "number" }).default(95).notNull(),
    // ASH
    ashStudentsEnrolled: p.numeric("ash_students_enrolled", { mode: "number" }).default(50).notNull(),
    ashVolunteers: p.numeric("ash_volunteers", { mode: "number" }).default(10).notNull(),
    ashCommunitiesEngaged: p.numeric("ash_communities_engaged", { mode: "number" }).default(1).notNull(),
    ashImprovedGrades: p.numeric("ash_improved_grades", { mode: "number" }).default(45).notNull(),
    // TACOTS
    tacotsEnrolled: p.numeric("tacots_enrolled", { mode: "number" }).default(20).notNull(),
    tacotsCurrentlyInSchools: p
      .numeric("tacots_currently_in_schools", { mode: "number" })
      .default(19)
      .notNull(),
    tacotsPartnerSchools: p.numeric("tacots_partner_schools", { mode: "number" }).default(6).notNull(),
    tacotsGraduated: p.numeric("tacots_graduated", { mode: "number" }).default(0).notNull(),
    // OUTREACHES
    outreachesCommunitiesEngaged: p
      .numeric("outreaches_communities_engaged", { mode: "number" })
      .default(5)
      .notNull(),
    outreachesBeneficiariesReached: p
      .numeric("outreaches_beneficiaries_reached", { mode: "number" })
      .default(991)
      .notNull(),
    outreachesPartners: p.numeric("outreaches_partners", { mode: "number" }).default(5).notNull(),
    outreachesVolunteers: p.numeric("outreaches_volunteers", { mode: "number" }).default(70).notNull(),
    outreachEvents: p.numeric("outreach_events", { mode: "number" }).default(5).notNull(),
    // CAPACITY BUILDING
    capacityParticipantsImpacted: p
      .numeric("capacity_participants_impacted", { mode: "number" })
      .default(132)
      .notNull(),
    capacityOrganizationsPartneredWith: p
      .numeric("capacity_organizations_partnered_with", { mode: "number" })
      .default(5)
      .notNull(),
    capacityVolunteersEngaged: p
      .numeric("capacity_volunteers_engaged", { mode: "number" })
      .default(15)
      .notNull(),
    capacityWorkshopsConducted: p
      .numeric("capacity_workshops_conducted", { mode: "number" })
      .default(6)
      .notNull(),
    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    reportDate: p.timestamp("report_date"),
  },
  (table) => [
    check(
      "impact_metrics_non_negative_check",
      sql`
        ${table.totalBeneficiaries} >= 0 AND
        ${table.communitiesImpacted} >= 0 AND
        ${table.yearsOfImpact} >= 0 AND
        ${table.volunteersEngaged} >= 0 AND
        ${table.ashStudentsEnrolled} >= 0 AND
        ${table.ashVolunteers} >= 0 AND
        ${table.ashCommunitiesEngaged} >= 0 AND
        ${table.ashImprovedGrades} >= 0 AND
        ${table.tacotsEnrolled} >= 0 AND
        ${table.tacotsCurrentlyInSchools} >= 0 AND
        ${table.tacotsPartnerSchools} >= 0 AND
        ${table.tacotsGraduated} >= 0 AND
        ${table.outreachesCommunitiesEngaged} >= 0 AND
        ${table.outreachesBeneficiariesReached} >= 0 AND
        ${table.outreachesPartners} >= 0 AND
        ${table.outreachesVolunteers} >= 0 AND
        ${table.outreachEvents} >= 0 AND
        ${table.capacityParticipantsImpacted} >= 0 AND
        ${table.capacityOrganizationsPartneredWith} >= 0 AND
        ${table.capacityVolunteersEngaged} >= 0 AND
        ${table.capacityWorkshopsConducted} >= 0
      `,
    ),

    index("impact_metrics_created_at_idx").on(table.createdAt),
  ],
);
