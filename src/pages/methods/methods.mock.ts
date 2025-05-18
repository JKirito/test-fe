import type { IMethodCard, IMethodCardLink, IMethodCardUser } from './methods.models';

export const MockMethodCards: IMethodCard[] = Array.from({ length: 6 }, (_, p) => ({
  title: `Parent ${p + 1}`,
  children: Array.from({ length: 6 }, (_, i) => ({
    title: `Sub-Service Level 1 - ${p + 1}.${i + 1}`,
    users: [
      { firstName: `First ${p + 1}.${i + 1}`, lastName: `Last ${p + 1}.${i + 1}` },
      { firstName: `First ${p + 1}.${i + 1}`, lastName: `Last ${p + 1}.${i + 1}` },
    ] as IMethodCardUser[],
    links: [
      {
        title: `Links for ${p + 1}.${i + 1}`,
        children: Array.from({ length: 2 }, (_, l) => ({
          title: `Link ${p + 1}.${i + 1}.${l + 1}`,
          url: `https://example.com/${p + 1}.${i + 1}.${l + 1}`,
        })),
      },
    ] as IMethodCardLink[],
    children: Array.from({ length: 6 }, (_, j) => ({
      title: `Method Level 2 - ${p + 1}.${i + 1}.${j + 1}`,
      showIndex: true,
      users: [
        {
          firstName: `First ${p + 1}.${i + 1}.${j + 1}`,
          lastName: `Last ${p + 1}.${i + 1}.${j + 1}`,
        },
        {
          firstName: `First ${p + 1}.${i + 1}.${j + 1}`,
          lastName: `Last ${p + 1}.${i + 1}.${j + 1}`,
        },
        {
          firstName: `First ${p + 1}.${i + 1}.${j + 1}`,
          lastName: `Last ${p + 1}.${i + 1}.${j + 1}`,
        },
      ] as IMethodCardUser[],
      links: [
        {
          title: `Links for ${p + 1}.${i + 1}.${j + 1}`,
          children: Array.from({ length: 2 }, (_, l) => ({
            title: `Link ${p + 1}.${i + 1}.${j + 1}.${l + 1}`,
            url: `https://example.com/${p + 1}.${i + 1}.${j + 1}.${l + 1}`,
          })),
        },
      ] as IMethodCardLink[],
    })),
  })),
}));

export const MockMethodTitles: string[] = ['Service Line', 'Sub-Service', 'Method'];
