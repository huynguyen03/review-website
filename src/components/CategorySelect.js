import { useMemo } from "react";

const buildCategoryTree = (categories, questions, parentId = null, level = 0) => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => {
      const categoryQuestionsCount = questions.filter(q => Number(q.category_id) === Number(category.category_id)).length;
      console.log("Đếm được", categoryQuestionsCount)
      const children = buildCategoryTree(categories, questions, category.category_id, level + 1);

      const totalQuestions = categoryQuestionsCount + 
        children.reduce((sum, child) => sum + child.question_count, 0);

      return {
        ...category,
        level,
        question_count: totalQuestions,
        children
      };
    });
};

const flattenCategoryTree = (tree) => {
  let result = [];
  tree.forEach(category => {
    result.push(category);
    result = result.concat(flattenCategoryTree(category.children));
  });
  return result;
};

const CategorySelect = ({ categories = [], questions = [] }) => {
    console.log("Danh mục nhận vào? ", categories, "Câu hỏi nhận vào? ", questions)
  const sortedCategories = useMemo(() => {
    const categoryTree = buildCategoryTree(categories, questions);
    return flattenCategoryTree(categoryTree);
  }, [categories, questions]);

  return (
    <>
      {sortedCategories.map(category => (
        <option key={category.category_id} value={category.category_id}>
          {"\u00A0\u00A0\u00A0".repeat(category.level) + "- " + category.category_name} ({category.question_count})
        </option>
      ))}
    </>
  );
};

export default CategorySelect;
