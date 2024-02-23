import Video from '@core/video/domain/video.aggregate';
import VideoMemoryRepository from './video-memory.repository';
import { CategoryId } from '@core/category/domain/category.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';

describe('VideoInMemoryRepository', () => {
    let repository: VideoMemoryRepository;

    beforeEach(() => (repository = new VideoMemoryRepository()));
    it('should no filter items when filter object is null', async () => {
        const items = [
            Video.fake().aVideoWithoutMedias().build(),
            Video.fake().aVideoWithoutMedias().build(),
        ];
        const filterSpy = jest.spyOn(items, 'filter' as any);

        const itemsFiltered = await repository['applyFilter'](
            items,
            null as any,
        );
        expect(filterSpy).not.toHaveBeenCalled();
        expect(itemsFiltered).toStrictEqual(items);
    });

    it('should filter items by title', async () => {
        const faker = Video.fake().aVideoWithAllMedias();
        const items = [
            faker.withTitle('test').build(),
            faker.withTitle('TEST').build(),
            faker.withTitle('fake').build(),
        ];
        const filterSpy = jest.spyOn(items, 'filter' as any);

        const itemsFiltered = await repository['applyFilter'](items, {
            title: 'TEST',
        });
        expect(filterSpy).toHaveBeenCalledTimes(1);
        expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
    });

    it('should filter items by categoriesId', async () => {
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const categoryId3 = new CategoryId();
        const categoryId4 = new CategoryId();
        const items = [
            Video.fake()
                .aVideoWithoutMedias()
                .addCategoryId(categoryId1)
                .addCategoryId(categoryId2)
                .build(),
            Video.fake()
                .aVideoWithoutMedias()
                .addCategoryId(categoryId3)
                .addCategoryId(categoryId4)
                .build(),
        ];
        const filterSpy = jest.spyOn(items, 'filter' as any);

        let itemsFiltered = await repository['applyFilter'](items, {
            categoriesId: [categoryId1],
        });
        expect(filterSpy).toHaveBeenCalledTimes(1);
        expect(itemsFiltered).toStrictEqual([items[0]]);

        itemsFiltered = await repository['applyFilter'](items, {
            categoriesId: [categoryId2],
        });
        expect(filterSpy).toHaveBeenCalledTimes(2);
        expect(itemsFiltered).toStrictEqual([items[0]]);

        itemsFiltered = await repository['applyFilter'](items, {
            categoriesId: [categoryId1, categoryId2],
        });
        expect(filterSpy).toHaveBeenCalledTimes(3);
        expect(itemsFiltered).toStrictEqual([items[0]]);

        itemsFiltered = await repository['applyFilter'](items, {
            categoriesId: [categoryId1, categoryId3],
        });
        expect(filterSpy).toHaveBeenCalledTimes(4);
        expect(itemsFiltered).toStrictEqual([...items]);

        itemsFiltered = await repository['applyFilter'](items, {
            categoriesId: [categoryId3, categoryId1],
        });
        expect(filterSpy).toHaveBeenCalledTimes(5);
        expect(itemsFiltered).toStrictEqual([...items]);
    });

    it('should filter items by title and categoriesId', async () => {
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const categoryId3 = new CategoryId();
        const categoryId4 = new CategoryId();
        const items = [
            Video.fake()
                .aVideoWithoutMedias()
                .withTitle('test')
                .addCategoryId(categoryId1)
                .addCategoryId(categoryId2)
                .build(),
            Video.fake()
                .aVideoWithoutMedias()
                .withTitle('fake')
                .addCategoryId(categoryId3)
                .addCategoryId(categoryId4)
                .build(),
            Video.fake()
                .aVideoWithoutMedias()
                .withTitle('test fake')
                .addCategoryId(categoryId1)
                .build(),
        ];

        let itemsFiltered = await repository['applyFilter'](items, {
            title: 'test',
            categoriesId: [categoryId1],
        });
        expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

        itemsFiltered = await repository['applyFilter'](items, {
            title: 'test',
            categoriesId: [categoryId3],
        });
        expect(itemsFiltered).toStrictEqual([]);

        itemsFiltered = await repository['applyFilter'](items, {
            title: 'fake',
            categoriesId: [categoryId4],
        });
        expect(itemsFiltered).toStrictEqual([items[1]]);
    });

    it('should filter items by title and categoriesId and genres_id', async () => {
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const categoryId3 = new CategoryId();
        const categoryId4 = new CategoryId();

        const genreId1 = new GenreId();
        const items = [
            Video.fake()
                .aVideoWithoutMedias()
                .withTitle('test')
                .addCategoryId(categoryId1)
                .addCategoryId(categoryId2)
                .build(),
            Video.fake()
                .aVideoWithoutMedias()
                .withTitle('fake')
                .addCategoryId(categoryId3)
                .addCategoryId(categoryId4)
                .build(),
            Video.fake()
                .aVideoWithoutMedias()
                .withTitle('test fake')
                .addCategoryId(categoryId1)
                .addGenreId(genreId1)
                .build(),
        ];

        const itemsFiltered = await repository['applyFilter'](items, {
            title: 'test',
            categoriesId: [categoryId1],
            genresId: [genreId1],
        });
        expect(itemsFiltered).toStrictEqual([items[2]]);
    });

    it('should sort by created_at when sort param is null', async () => {
        const items = [
            Video.fake()
                .aVideoWithoutMedias()
                .withCreatedAt(new Date())
                .build(),
            Video.fake()
                .aVideoWithoutMedias()
                .withCreatedAt(new Date(new Date().getTime() + 1))
                .build(),
            Video.fake()
                .aVideoWithoutMedias()
                .withCreatedAt(new Date(new Date().getTime() + 2))
                .build(),
        ];

        const itemsSorted = await repository['applySorting'](items, null, null);
        expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
    });

    it('should sort by title', async () => {
        const items = [
            Video.fake().aVideoWithoutMedias().withTitle('c').build(),
            Video.fake().aVideoWithoutMedias().withTitle('b').build(),
            Video.fake().aVideoWithoutMedias().withTitle('a').build(),
        ];

        let itemsSorted = await repository['applySorting'](
            items,
            'title',
            'asc',
        );
        expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

        itemsSorted = await repository['applySorting'](items, 'title', 'desc');
        expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
    });
});
