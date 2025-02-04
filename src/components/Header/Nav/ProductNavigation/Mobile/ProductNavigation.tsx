import * as Dialog from "@radix-ui/react-dialog"
import React, { useEffect } from "react"
import { ProductsNav, SubProducts } from "../../config"
import { SearchTrigger } from "../../NavBar"
import { isMatchedPath } from "../../isMatchedPath"
import { clsx } from "../../utils"
import { CaretIcon } from "../CaretIcon"
import { extendRadixComponent } from "../extendRadixComponent"
import { BottomBar } from "./BottomBar"
import { ProductContent } from "./ProductContent"
import { SubProductContent } from "./SubProductContent"
import styles from "./productNavigation.module.css"

type Props = {
  searchTrigger?: SearchTrigger
  productsNav: ProductsNav
  path: string
}

const Trigger = extendRadixComponent(Dialog.Trigger)
const Close = extendRadixComponent(Dialog.Close)
const Portal = extendRadixComponent(Dialog.Portal)
const Root = extendRadixComponent(Dialog.Root)

export function ProductNavigation({ productsNav, path }: Props) {
  const [open, setOpen] = React.useState(false)
  const [subProducts, setSubProducts] = React.useState<SubProducts | undefined>(undefined)
  const [showSearch, setShowSearch] = React.useState(false)
  const [productsSlidePosition, setProductsSlidePosition] = React.useState<"main" | "submenu">("main")
  const closeButtonRef = React.useRef(null)

  useEffect(() => {
    const foundSubProduct = productsNav.categories.find((category) =>
      category.items.some((item) => item.subProducts && isMatchedPath(path, item.href))
    )

    if (foundSubProduct) {
      const subProduct = foundSubProduct.items.find((item) => item.subProducts && isMatchedPath(path, item.href))

      if (subProduct?.subProducts && Array.isArray(subProduct.subProducts)) {
        const items = subProduct.subProducts.map((subProductItem) => ({
          label: subProductItem.label,
          href: "#",
          pages: subProductItem.items.map((page) => ({
            label: page.label,
            href: page.href,
            children: page.children || [],
          })),
        }))

        const safeSubProducts: SubProducts = {
          label: subProduct.label,
          items,
        }

        setSubProducts(safeSubProducts)
        setProductsSlidePosition("submenu")
      }
    } else {
      setSubProducts(undefined)
    }
  }, [path, productsNav])

  const onProductClick = React.useCallback((subProducts: SubProducts) => {
    setSubProducts(subProducts)
    setProductsSlidePosition("submenu")
  }, [])

  const onSubproductClick = () => {
    setProductsSlidePosition("main")
    setSubProducts(undefined)
  }

  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState)
    if (!newOpenState) {
      setProductsSlidePosition("main")
      setShowSearch(false)
      setSubProducts(undefined)
    }
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger data-testid="product-navigation-trigger-mobile" className={styles.trigger}>
        <img
          alt="Documentation Home"
          title="Documentation Home"
          style={{ display: "flex" }}
          src="/chainlink-docs.svg"
          height={30}
        />
        <CaretIcon
          style={{
            color: "var(--color-text-primary)",
            fill: "var(--color-text-primary)",
          }}
        />
      </Trigger>

      <Portal>
        <Dialog.Overlay />
        <Dialog.Content className={clsx(styles.menuContent)}>
          <div className={clsx(styles.content, styles[showSearch ? "submenu" : "main"])}>
            <div
              style={{
                position: "relative",
                display: "flex",
                width: "100vw",
                overflow: "hidden",
              }}
            >
              <div className={clsx(styles.content, styles[productsSlidePosition])}>
                <ul className={clsx(styles.productContent)}>
                  <ProductContent onProductClick={onProductClick} productsNav={productsNav} />
                </ul>
                <div className={clsx(styles.subProductContent)}>
                  <SubProductContent
                    subProducts={subProducts}
                    onSubproductClick={onSubproductClick}
                    currentPath={path}
                  />
                </div>
              </div>
            </div>
          </div>
          <Close ref={closeButtonRef} className={styles.closeButton}>
            <img src="/assets/icons/close.svg" />
          </Close>
          <BottomBar />
        </Dialog.Content>
      </Portal>
    </Root>
  )
}

export default ProductNavigation
