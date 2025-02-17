import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

export class TestSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        // em.create(RepetitionSpec, {
        //     startDate: "2025-02-02T19:57:51.803Z",
        //     repeatOption: RepeatOptions.Custom,
        //     repeatCustomFrequency: RepeatCustomOptions.Weekly,
        //     repeatCustomAmount: "9",
        //     repeatsOnWeekDays: [DaysOfTheWeek.Monday, DaysOfTheWeek.Tuesday, DaysOfTheWeek.Wednesday],
        //     repeatsOnMonthPickerType: RepeatsOnMonthPickerType.Each,
        //     timeBeforeStartDateForCreation: StartDateOptions.AtExactly,
        //     repeatsOnMonthDays: [1, 14, 17, 25],
        //     repeatsOnMonthOnThe: [RepeatsOnTheWhen.Last, RepeatsOnTheDays.WeekendDay],
        //     repeatsOnYearMonths: [Months.January, Months.February, Months.March],
        //     endRepeat: EndRepeatOptions.Never,
        //     iterations: 0,
        //     statusOnCreationIndex: 0,
        //     boardId: "8109281540",
        //     taskId: "8226969499",
        //     paused: false,
        //     hasSubitems: false,
        // });
    }
}
