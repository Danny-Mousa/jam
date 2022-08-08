import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import Skeleton from "../../components/Skeleton";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
});

export const getStaticPaths = async () => {
  const res = await client.getEntries({ content_type: "recipe" });

  const paths = res.items.map((item) => {
    return {
      params: {
        slug: item.fields.slug,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

// getStaticProps will be excuted for every paths array element in order
// to get every possible page prepared

export const getStaticProps = async ({ params } = context) => {
  const { items } = await client.getEntries({
    content_type: "recipe",
    "fields.slug": params.slug,
  });

  return {
    props: {
      recipe: items[0],
      revalidate: 1,
    },
  };
};

// I think whenever the user use an url /recipes/[slug]
// => next will search for the data which is related to this slug
// then will pass it to the "RecipeDetails" component, so it can render using it
// So, if data for that slug wasn't exist, then pass "undefined" to the "RecipeDetails"
// while next is fetching this new data in the background using "getStaticProps", and after the data is ready
// it will pass it to the component, and render it in the server, then send its html to the
// browser
// so we need a placeholder or spinner in that waiting time

export default function RecipeDetails({ recipe }) {
  if (!recipe) return <Skeleton />;

  const { featuredImage, title, cookingTime, ingredients, method } =
    recipe.fields;

  // method is for rich text content طريقة عمل الوصفة يعني وليس المقصود تابع
  console.log(method);

  return (
    <div>
      <div className="banner">
        <Image
          src={"https:" + featuredImage.fields.file.url}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
        />
        <h2>{title}</h2>
      </div>

      <div className="info">
        <p>Takes about {cookingTime} mins to cook.</p>
        <h3>Ingredients:</h3>

        {ingredients.map((ing) => (
          <span key={ing}>{ing}</span>
        ))}
      </div>

      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method)}</div>
      </div>

      <style jsx>{`
        h2,
        h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
      `}</style>
    </div>
  );
}
